import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { Difficulty, LengthBucket } from "../word.types";

export type DifficultyParam = Difficulty | "any";
export type LengthParam = LengthBucket | "any";

export class RandomWordQueryDto {
  @IsOptional()
  @IsIn(["any", "easy", "medium", "hard"])
  difficulty: DifficultyParam = "any";

  @IsOptional()
  @IsIn(["any", "short", "medium", "long"])
  length: LengthParam = "any";

  /** Avoid returning this word again (so "new word" actually changes). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  exclude?: string;
}
