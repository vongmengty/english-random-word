import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { StudyModule } from "./study/study.module";
import { WordsModule } from "./words/words.module";

@Module({
  imports: [DatabaseModule, WordsModule, FavoritesModule, StudyModule]
})
export class AppModule {}
