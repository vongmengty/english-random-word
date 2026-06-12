import { Controller, Get, Query } from "@nestjs/common";
import {
  RandomWordResponse,
  WordCategory,
  WordQueryValue,
  WordRelationship
} from "./word.types";
import { WordsService } from "./words.service";

@Controller("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get("relationships")
  getRelationships(@Query("word") word?: string): WordRelationship[] {
    return this.wordsService.getWordRelationships(word);
  }

  @Get("categories")
  getCategories(
    @Query("level") level?: WordQueryValue,
    @Query("levels") levels?: WordQueryValue
  ): WordCategory[] {
    return this.wordsService.getAvailableCategories(levels ?? level);
  }

  @Get("lookup")
  getWord(
    @Query("word") word?: string,
    @Query("sentences") sentences?: string
  ): RandomWordResponse {
    return this.wordsService.getWord(word, sentences);
  }

  @Get("random")
  getRandomWord(
    @Query("filter") filter?: WordQueryValue,
    @Query("level") level?: WordQueryValue,
    @Query("levels") levels?: WordQueryValue,
    @Query("category") category?: WordQueryValue,
    @Query("categories") categories?: WordQueryValue,
    @Query("sentences") sentences?: string
  ): RandomWordResponse {
    return this.wordsService.getRandomWord(
      {
        filter,
        levels: levels ?? level,
        categories: categories ?? category
      },
      sentences
    );
  }
}
