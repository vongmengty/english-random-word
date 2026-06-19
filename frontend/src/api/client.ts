import type {
  DifficultyFilter,
  Favorite,
  LengthFilter,
  StudyStats,
  Translation,
  WordEntry
} from "../types";

const BASE = "/api";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init
    });
  } catch {
    throw new ApiError("Network error — is the server running?", 0);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(", ");
    } catch {
      /* keep default message */
    }
    throw new ApiError(message, res.status);
  }

  // 204 No Content (e.g. logging a study event) has no body to parse.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface RandomWordParams {
  difficulty: DifficultyFilter;
  length: LengthFilter;
  exclude?: string;
}

export const api = {
  randomWord({ difficulty, length, exclude }: RandomWordParams): Promise<WordEntry> {
    const params = new URLSearchParams({ difficulty, length });
    if (exclude) params.set("exclude", exclude);
    return request<WordEntry>(`/words/random?${params.toString()}`);
  },

  lookup(word: string): Promise<WordEntry> {
    return request<WordEntry>(`/words/${encodeURIComponent(word)}`);
  },

  listFavorites(): Promise<Favorite[]> {
    return request<Favorite[]>("/favorites");
  },

  addFavorite(word: string): Promise<Favorite[]> {
    return request<Favorite[]>("/favorites", {
      method: "POST",
      body: JSON.stringify({ word })
    });
  },

  removeFavorite(word: string): Promise<Favorite[]> {
    return request<Favorite[]>(`/favorites/${encodeURIComponent(word)}`, {
      method: "DELETE"
    });
  },

  logStudy(word: string): Promise<void> {
    return request<void>("/study", {
      method: "POST",
      body: JSON.stringify({ word })
    });
  },

  studyStats(): Promise<StudyStats> {
    return request<StudyStats>("/study/stats");
  },

  translate(word: string, to = "km"): Promise<Translation> {
    const params = new URLSearchParams({ word, to });
    return request<Translation>(`/translate?${params.toString()}`);
  }
};
