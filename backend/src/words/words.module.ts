import { Module } from "@nestjs/common";
import { DictionaryService } from "../dictionary/dictionary.service";
import { WordsController } from "./words.controller";
import { WordsService } from "./words.service";

@Module({
  controllers: [WordsController],
  providers: [WordsService, DictionaryService],
  exports: [WordsService]
})
export class WordsModule {}
