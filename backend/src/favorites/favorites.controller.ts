import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CreateFavoriteDto } from "./dto/create-favorite.dto";
import { Favorite, FavoritesService } from "./favorites.service";

@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(): Favorite[] {
    return this.favoritesService.list();
  }

  @Post()
  add(@Body() body: CreateFavoriteDto): Favorite[] {
    return this.favoritesService.add(body.word);
  }

  @Delete(":word")
  remove(@Param("word") word: string): Favorite[] {
    return this.favoritesService.remove(word);
  }
}
