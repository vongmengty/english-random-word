import { EnglishLevel, VocabularyWord } from "../word.types";
import { a1Vocabulary } from "./a1";
import { a2Vocabulary } from "./a2";
import { b1Vocabulary } from "./b1";
import { b2Vocabulary } from "./b2";
import { c1Vocabulary } from "./c1";
import { c2Vocabulary } from "./c2";

export const vocabularyByLevel: Record<EnglishLevel, VocabularyWord[]> = {
  A1: a1Vocabulary,
  A2: a2Vocabulary,
  B1: b1Vocabulary,
  B2: b2Vocabulary,
  C1: c1Vocabulary,
  C2: c2Vocabulary
};
