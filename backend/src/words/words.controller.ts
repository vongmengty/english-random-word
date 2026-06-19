import { Controller, Get, Param, Query } from "@nestjs/common";
import { RandomWordQueryDto } from "./dto/random-word.dto";
import { WordEntry } from "./word.types";
import { WordsService } from "./words.service";

@Controller("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get("random")
  getRandom(@Query() query: RandomWordQueryDto): Promise<WordEntry> {
    return this.wordsService.getRandom(query.difficulty, query.length, query.exclude);
  }

  @Get(":word")
  lookup(@Param("word") word: string): Promise<WordEntry> {
    return this.wordsService.lookup(word);
  }
}
