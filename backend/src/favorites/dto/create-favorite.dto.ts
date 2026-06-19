import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  word: string;
}
