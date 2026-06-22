import { CATEGORIES, type MatchResult } from "./match-data";
import { relativeTime } from "./study-format";

export interface GameStatVM {
  label: string;
  big: string;
  unit: string;
  accent: string;
  soft: string;
}

export interface GameCatVM {
  name: string;
  icon: string;
  color: string;
  pct: number;
  pctLabel: string;
}

export interface GameRecentVM {
  name: string;
  icon: string;
  score: string;
  color: string;
  when: string;
}

export interface GameStatsVM {
  has: boolean;
  cards: GameStatVM[];
  cats: GameCatVM[];
  recent: GameRecentVM[];
}

const EMPTY: GameStatsVM = { has: false, cards: [], cats: [], recent: [] };

function accuracyColor(pct: number): string {
  return pct >= 75 ? "#0F9D6B" : pct >= 50 ? "#F0611C" : "#E5484D";
}

/** Summarise match-game history into the cards/charts the study page renders. */
export function gameStats(history: MatchResult[], now = Date.now()): GameStatsVM {
  if (!history.length) return EMPTY;

  const games = history.length;
  const sumCorrect = history.reduce((acc, g) => acc + g.correct, 0);
  const sumTotal = history.reduce((acc, g) => acc + g.total, 0);
  const avgAcc = sumTotal ? Math.round((sumCorrect / sumTotal) * 100) : 0;
  const bestAcc = history.reduce(
    (max, g) => Math.max(max, Math.round((g.correct / g.total) * 100)),
    0
  );

  const cards: GameStatVM[] = [
    {
      label: "Games played",
      big: String(games),
      unit: games === 1 ? "game" : "games",
      accent: "#7A4FF0",
      soft: "#EFE9FF"
    },
    { label: "Avg accuracy", big: `${avgAcc}%`, unit: "", accent: "#0F9D6B", soft: "#D6F4E8" },
    { label: "Best round", big: `${bestAcc}%`, unit: "", accent: "#F0611C", soft: "#FFE3CE" },
    {
      label: "Words correct",
      big: String(sumCorrect),
      unit: "total",
      accent: "#1F7BE8",
      soft: "#D2E5FF"
    }
  ];

  const cats: GameCatVM[] = CATEGORIES.map((cat) => {
    const catGames = history.filter((g) => g.cat === cat.id);
    const correct = catGames.reduce((acc, g) => acc + g.correct, 0);
    const total = catGames.reduce((acc, g) => acc + g.total, 0);
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return {
      name: cat.name,
      icon: cat.icon,
      color: cat.theme.accent,
      pct,
      pctLabel: total ? `${pct}%` : "—"
    };
  });

  const recent: GameRecentVM[] = history
    .slice()
    .reverse()
    .slice(0, 6)
    .map((g) => {
      const pct = Math.round((g.correct / g.total) * 100);
      return {
        name: g.name,
        icon: g.icon,
        score: `${g.correct}/${g.total}`,
        color: accuracyColor(pct),
        when: relativeTime(g.ts, now)
      };
    });

  return { has: true, cards, cats, recent };
}
