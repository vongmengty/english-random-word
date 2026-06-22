import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { DifficultyParam, LengthParam } from "./random-word.dto";

/** Query for a batch of random word strings (used by the Match game). */
export class SampleWordsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  count = 8;

  @IsOptional()
  @IsIn(["any", "easy", "medium", "hard"])
  difficulty: DifficultyParam = "any";

  @IsOptional()
  @IsIn(["any", "short", "medium", "long"])
  length: LengthParam = "any";
}
