import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class TranslateQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  word: string;

  /** Target language. Khmer (`km`) is the only one the UI uses today. */
  @IsOptional()
  @IsIn(["km"])
  to: string = "km";
}
