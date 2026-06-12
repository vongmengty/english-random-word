<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type SentenceCount = 3 | 4;
type WordCategory =
  | "animals"
  | "art"
  | "business"
  | "communication"
  | "daily life"
  | "descriptions"
  | "family"
  | "feelings"
  | "food"
  | "health"
  | "home"
  | "learning"
  | "people"
  | "school"
  | "society"
  | "technology"
  | "thinking"
  | "time"
  | "transport"
  | "travel"
  | "weather"
  | "work";

interface RandomWord {
  level: EnglishLevel;
  word: string;
  category: WordCategory;
  phoneticSpelling: string;
  partOfSpeech: string;
  meaning: string;
  explanation: string;
  synonyms: string[];
  antonyms: string[];
  sentences: string[];
  sentenceCount: SentenceCount;
  totalWords: number;
}

interface WordRelationshipExample {
  from: string;
  to: string;
}

interface WordRelationship {
  kind: "synonyms" | "antonyms";
  title: string;
  description: string;
  examples: WordRelationshipExample[];
}

const defaultSentenceCount: SentenceCount = 3;
const englishLevels: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const selectedLevels = ref<EnglishLevel[]>(["A1"]);
const selectedCategories = ref<WordCategory[]>([]);
const categoryOptions = ref<WordCategory[]>([]);
const currentWord = ref<RandomWord | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");

const currentWordRelationships = computed(
  () =>
    currentWord.value
      ? [
          {
            kind: "synonyms" as const,
            title: "Synonyms",
            description: "Words with similar meaning.",
            examples: currentWord.value.synonyms.map((synonym) => ({
              from: currentWord.value?.word ?? "",
              to: synonym
            }))
          },
          {
            kind: "antonyms" as const,
            title: "Antonyms",
            description: "Opposite words.",
            examples: currentWord.value.antonyms.map((antonym) => ({
              from: currentWord.value?.word ?? "",
              to: antonym
            }))
          }
        ]
      : []
);

const sentenceLabel = computed(() => {
  const count = currentWord.value?.sentences.length ?? defaultSentenceCount;
  return `${count} example${count === 1 ? "" : "s"}`;
});

function formatCategory(category: string) {
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function getResponseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(payload.message)) {
      return payload.message.join(" ");
    }

    return payload.message ?? "Could not load a random word.";
  } catch {
    return "Could not load a random word.";
  }
}

function buildLevelParams(levels = selectedLevels.value) {
  const params = new URLSearchParams();

  levels.forEach((level) => params.append("levels", level));

  return params;
}

async function fetchCategoryOptions(levels = selectedLevels.value) {
  const params = buildLevelParams(levels);
  const query = params.toString();
  const response = await fetch(`/api/words/categories${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response));
  }

  const nextCategories = (await response.json()) as WordCategory[];

  categoryOptions.value = nextCategories;
  selectedCategories.value = selectedCategories.value.filter((category) =>
    nextCategories.includes(category)
  );
}

async function fetchRandomWord() {
  isLoading.value = true;
  errorMessage.value = "";

  const params = new URLSearchParams({
    sentences: String(defaultSentenceCount)
  });

  selectedLevels.value.forEach((level) => params.append("levels", level));
  selectedCategories.value.forEach((category) =>
    params.append("categories", category)
  );

  try {
    const response = await fetch(`/api/words/random?${params.toString()}`);

    if (!response.ok) {
      throw new Error(await getResponseErrorMessage(response));
    }

    currentWord.value = (await response.json()) as RandomWord;
  } catch (error) {
    currentWord.value = null;
    errorMessage.value =
      error instanceof Error ? error.message : "Could not load a random word.";
  } finally {
    isLoading.value = false;
  }
}

async function fetchWordByText(word: string) {
  isLoading.value = true;
  errorMessage.value = "";

  const params = new URLSearchParams({
    word,
    sentences: String(defaultSentenceCount)
  });

  try {
    const response = await fetch(`/api/words/lookup?${params.toString()}`);

    if (!response.ok) {
      throw new Error(await getResponseErrorMessage(response));
    }

    const nextWord = (await response.json()) as RandomWord;

    currentWord.value = {
      ...nextWord,
      totalWords: currentWord.value?.totalWords ?? nextWord.totalWords
    };
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Could not load this word.";
  } finally {
    isLoading.value = false;
  }
}

async function refreshAfterLevelChange(nextLevels: EnglishLevel[]) {
  selectedLevels.value = nextLevels;
  errorMessage.value = "";

  try {
    await fetchCategoryOptions(nextLevels);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Could not load categories.";
  }

  await fetchRandomWord();
}

function hasAnyFilter(levels = selectedLevels.value, categories = selectedCategories.value) {
  return levels.length > 0 || categories.length > 0;
}

function toggleLevel(level: EnglishLevel) {
  const nextSelections = new Set(selectedLevels.value);

  if (nextSelections.has(level)) {
    nextSelections.delete(level);
  } else {
    nextSelections.add(level);
  }

  const nextLevels = englishLevels.filter((option) => nextSelections.has(option));

  if (!hasAnyFilter(nextLevels, selectedCategories.value)) {
    return;
  }

  selectedLevels.value = nextLevels;
  void refreshAfterLevelChange(nextLevels);
}

function toggleCategory(category: WordCategory) {
  const nextSelections = new Set(selectedCategories.value);

  if (nextSelections.has(category)) {
    nextSelections.delete(category);
  } else {
    nextSelections.add(category);
  }

  const nextCategories = categoryOptions.value.filter((option) =>
    nextSelections.has(option)
  );

  if (!hasAnyFilter(selectedLevels.value, nextCategories)) {
    return;
  }

  selectedCategories.value = nextCategories;
  void fetchRandomWord();
}

onMounted(() => {
  void (async () => {
    try {
      await fetchCategoryOptions();
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Could not load categories.";
    }

    await fetchRandomWord();
  })();
});
</script>

<template>
  <main class="page">
    <section class="practice" aria-labelledby="dashboard-title">
      <header class="page-header">
        <div>
          <p class="eyebrow">English Practice</p>
          <h1 id="dashboard-title">Vocabulary</h1>
        </div>

        <div class="total-badge" aria-live="polite">
          {{ currentWord?.totalWords ?? 0 }} words
        </div>
      </header>

      <section class="toolbar" aria-label="Word filters">
        <div class="control-group">
          <span class="control-label">Levels</span>
          <button
            v-for="level in englishLevels"
            :key="level"
            :aria-pressed="selectedLevels.includes(level)"
            :class="{ 'is-active': selectedLevels.includes(level) }"
            class="chip"
            type="button"
            @click="toggleLevel(level)"
          >
            {{ level }}
          </button>
        </div>

        <div class="control-group category-group">
          <span class="control-label">Categories</span>
          <button
            v-for="category in categoryOptions"
            :key="category"
            :aria-pressed="selectedCategories.includes(category)"
            :class="{ 'is-active': selectedCategories.includes(category) }"
            class="chip"
            type="button"
            @click="toggleCategory(category)"
          >
            {{ formatCategory(category) }}
          </button>
        </div>

        <button
          class="primary-action"
          type="button"
          :disabled="isLoading"
          @click="fetchRandomWord"
        >
          <span class="shuffle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M16 3h5v5" />
              <path d="M4 20 21 3" />
              <path d="M21 16v5h-5" />
              <path d="m15 15 6 6" />
              <path d="M4 4l5 5" />
            </svg>
          </span>
          {{ isLoading ? "Loading..." : "Random word" }}
        </button>
      </section>

      <section class="relationships" aria-labelledby="relationships-title">
        <div class="relationships-header">
          <h2 id="relationships-title">Word Relationships</h2>
          <span v-if="currentWord">For: {{ currentWord.word }}</span>
          <span v-else>0 types</span>
        </div>

        <div class="relationship-grid">
          <article
            v-for="relationship in currentWordRelationships"
            :key="relationship.title"
            class="relationship-card"
          >
            <div class="relationship-title-row">
              <h3>{{ relationship.title }}</h3>
            </div>
            <p>{{ relationship.description }}</p>
            <ul v-if="relationship.examples.length" class="relationship-pairs">
              <li
                v-for="example in relationship.examples"
                :key="`${relationship.kind}-${example.from}-${example.to}`"
              >
                <button
                  class="relationship-word"
                  type="button"
                  :disabled="isLoading"
                  :aria-label="`Check word ${example.to}`"
                  @click="fetchWordByText(example.to)"
                >
                  {{ example.to }}
                </button>
              </li>
            </ul>
            <p v-else class="relationship-empty">
              No {{ relationship.title.toLowerCase() }} for this word yet.
            </p>
          </article>
        </div>
      </section>

      <div class="content-grid">
        <section class="word-panel" aria-live="polite">
          <div v-if="currentWord" class="word-content">
            <div class="word-meta">
              <span>{{ currentWord.level }}</span>
              <span>{{ currentWord.partOfSpeech }}</span>
              <span class="category-chip">
                Topic: {{ formatCategory(currentWord.category) }}
              </span>
            </div>
            <div class="word-title">
              <h2>{{ currentWord.word }}</h2>
              <p
                v-if="currentWord.phoneticSpelling"
                class="word-phonetic"
                aria-label="Phonetic spelling"
              >
                {{ currentWord.phoneticSpelling }}
              </p>
            </div>
            <p class="word-meaning">{{ currentWord.meaning }}</p>
            <p class="word-explanation">{{ currentWord.explanation }}</p>
          </div>

          <div v-else class="empty-state">
            <span>{{ isLoading ? "Loading word..." : "No word loaded" }}</span>
          </div>
        </section>

        <section class="sentence-panel" aria-labelledby="sentences-title">
          <div class="section-heading">
            <h2 id="sentences-title">Sentences</h2>
            <span>{{ sentenceLabel }}</span>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <ol v-else class="sentence-list">
            <li v-for="sentence in currentWord?.sentences ?? []" :key="sentence">
              {{ sentence }}
            </li>
          </ol>
        </section>
      </div>
    </section>
  </main>
</template>
