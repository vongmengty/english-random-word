import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { LogStudyDto } from "./dto/log-study.dto";
import { StudyService } from "./study.service";
import { StudyStats } from "./study.types";

@Controller("study")
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post()
  @HttpCode(204)
  log(@Body() body: LogStudyDto): void {
    this.studyService.log(body.word);
  }

  @Get("stats")
  stats(): StudyStats {
    return this.studyService.getStats();
  }
}
