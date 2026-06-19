import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LogStudyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  word: string;
}
