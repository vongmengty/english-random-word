import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  app.enableCors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
  });
  app.setGlobalPrefix("api");

  await app.listen(port);
}

void bootstrap();
