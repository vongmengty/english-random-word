import { Injectable, Logger } from "@nestjs/common";
import { WordMeaning } from "../words/word.types";

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const TIMEOUT_MS = 8000;

/** The subset of the Free Dictionary API response we read. */
interface ApiDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}
interface ApiMeaning {
  partOfSpeech: string;
  definitions?: ApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}
interface ApiEntry {
  word: string;
  phonetic?: string;
  origin?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: ApiMeaning[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  audio: string;
  origin: string;
  meanings: WordMeaning[];
  synonyms: string[];
  antonyms: string[];
}

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  /** Look a word up in the Free Dictionary API. Returns null on any failure
   *  (network, 404, malformed) so callers can fall back to another word. */
  async fetchEntry(word: string): Promise<DictionaryEntry | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(API_BASE + encodeURIComponent(word), {
        signal: controller.signal
      });
      if (!res.ok) return null;
      const data = (await res.json()) as unknown;
      return this.normalize(data);
    } catch (err) {
      this.logger.warn(
        `dictionary lookup failed for "${word}": ${err instanceof Error ? err.message : String(err)}`
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private normalize(data: unknown): DictionaryEntry | null {
    if (!Array.isArray(data) || !data.length) return null;
    const entries = data as ApiEntry[];
    const first = entries[0];
    if (!first?.word) return null;

    let phonetic = first.phonetic ?? "";
    let audio = "";
    let origin = first.origin ?? "";
    for (const entry of entries) {
      for (const p of entry.phonetics ?? []) {
        if (!phonetic && p.text) phonetic = p.text;
        if (!audio && p.audio) audio = p.audio;
      }
      if (!origin && entry.origin) origin = entry.origin;
    }
    if (audio.startsWith("//")) audio = "https:" + audio;

    const meanings: WordMeaning[] = [];
    const synonyms: string[] = [];
    const antonyms: string[] = [];
    const pushUnique = (list: string[], values?: string[]) => {
      for (const v of values ?? []) if (!list.includes(v)) list.push(v);
    };

    for (const meaning of first.meanings ?? []) {
      pushUnique(synonyms, meaning.synonyms);
      pushUnique(antonyms, meaning.antonyms);
      if (meanings.length >= 3) continue;
      const definitions = (meaning.definitions ?? []).slice(0, 2).map((d) => {
        pushUnique(synonyms, d.synonyms);
        pushUnique(antonyms, d.antonyms);
        return { definition: d.definition, example: d.example ?? null };
      });
      if (definitions.length) {
        meanings.push({ partOfSpeech: meaning.partOfSpeech, definitions });
      }
    }
    if (!meanings.length) return null;

    const lower = first.word.toLowerCase();
    return {
      word: first.word,
      phonetic,
      audio,
      origin,
      meanings,
      synonyms: synonyms.filter((s) => s.toLowerCase() !== lower).slice(0, 9),
      antonyms: antonyms.filter((a) => a.toLowerCase() !== lower).slice(0, 5)
    };
  }
}
