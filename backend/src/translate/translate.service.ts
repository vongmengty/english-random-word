import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TIMEOUT_MS = 8000;

export interface Translation {
  word: string;
  lang: string;
  text: string;
}

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);

  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  /** Translate a word, serving from the SQLite cache when possible and
   *  fetching + caching it on a miss. */
  async translate(word: string, lang: string): Promise<Translation> {
    const trimmed = word.trim();

    const cached = this.db
      .prepare("SELECT text FROM translations WHERE word = ? COLLATE NOCASE AND lang = ?")
      .get(trimmed, lang) as { text: string } | undefined;
    if (cached) return { word: trimmed, lang, text: cached.text };

    const text = await this.fetchTranslation(trimmed, lang);
    if (!text) {
      throw new BadGatewayException("Couldn't translate that word. Try again.");
    }

    this.db
      .prepare("INSERT OR IGNORE INTO translations (word, lang, text) VALUES (?, ?, ?)")
      .run(trimmed, lang, text);

    return { word: trimmed, lang, text };
  }

  private async fetchTranslation(word: string, lang: string): Promise<string | null> {
    const params = new URLSearchParams({
      client: "gtx",
      sl: "en",
      tl: lang,
      dt: "t",
      q: word
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
        signal: controller.signal
      });
      if (!res.ok) return null;
      const data = (await res.json()) as unknown;
      return this.parse(data);
    } catch (err) {
      this.logger.warn(
        `translation failed for "${word}" → ${lang}: ${err instanceof Error ? err.message : String(err)}`
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /** The gtx endpoint returns `[[[ "translated", "source", ... ], ...], ...]`. */
  private parse(data: unknown): string | null {
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const segments = data[0] as unknown[];
    const text = segments
      .map((seg) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
      .join("")
      .trim();
    return text || null;
  }
}
