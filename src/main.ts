import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // Avoid creating/updating objects with fields not included in DTO by ignoring them:
      whitelist: true,
      // Avoid creating/updating objects with fields not included in DTO by throwing an error 400
      forbidNonWhitelisted: true,
      // Enable auto transform feature to transform body in an instance of the proper DTO,
      // or path/query params to booleans or numbers depending on the indicated type in the controller
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
