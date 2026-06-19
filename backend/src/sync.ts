import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SyncProgress, WordsService } from "./words/words.service";

const DEFAULT_MORE_LIMIT = 200;

/**
 * One-shot CLI to populate the SQLite word cache from the Free Dictionary API.
 *
 *   npm run sync               → sync the curated pool (90 words)
 *   npm run sync:more          → fetch ~200 more common words
 *   npm run sync:more -- --limit=500
 *
 * Already-cached words are skipped, so every mode is safe to re-run.
 */
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const more = args.includes("--more") || limitArg !== undefined;
  const limit = limitArg
    ? Math.max(1, parseInt(limitArg.split("=")[1], 10) || DEFAULT_MORE_LIMIT)
    : Number(process.env.SYNC_LIMIT) || DEFAULT_MORE_LIMIT;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error"]
  });
  const words = app.get(WordsService);

  const log = ({ done, total, word, outcome }: SyncProgress) => {
    const tag =
      outcome === "fetched" ? "✓ fetched" : outcome === "cached" ? "• cached " : "✗ failed ";
    console.log(`[${String(done).padStart(3)}/${total}] ${tag}  ${word}`);
  };

  let summary;
  if (more) {
    console.log(`Fetching up to ${limit} more common words into SQLite …\n`);
    summary = await words.syncMore(limit, log);
    console.log(
      `\nDone. ${summary.fetched} new words cached, ${summary.failed} not found ` +
        `(of ${summary.total} attempted).`
    );
  } else {
    console.log("Syncing curated words from api.dictionaryapi.dev …\n");
    summary = await words.syncAll(log);
    console.log(
      `\nDone. ${summary.fetched} fetched, ${summary.cached} already cached, ` +
        `${summary.failed} failed (of ${summary.total}).`
    );
  }

  if (summary.failures.length) {
    console.log(`Not found in the dictionary: ${summary.failures.join(", ")}`);
  }

  await app.close();
  process.exit(summary.failed === summary.total && summary.total > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
