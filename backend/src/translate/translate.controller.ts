import { Controller, Get, Query } from "@nestjs/common";
import { TranslateQueryDto } from "./dto/translate-query.dto";
import { Translation, TranslateService } from "./translate.service";

@Controller("translate")
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Get()
  translate(@Query() query: TranslateQueryDto): Promise<Translation> {
    return this.translateService.translate(query.word, query.to);
  }
}
