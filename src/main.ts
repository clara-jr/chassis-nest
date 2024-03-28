import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT || 8080;

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
      transformOptions: {
        // With this configuration, is no longer needed to specify the @Type in the attributes of the DTOs
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(PORT);
}
bootstrap();
