import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import {
  ApiError,
  HttpExceptionFilter,
} from './middlewares/http-exception.filter';

const PORT = process.env.PORT || 8080;

function setup(app) {
  app.useGlobalPipes(
    new ValidationPipe({
      // Avoid creating/updating objects with fields not included in DTO by ignoring them:
      whitelist: true,
      // Enable auto transform feature to transform body in an instance of the proper DTO,
      // or path/query params to booleans or numbers depending on the indicated type in the controller
      transform: true,
      transformOptions: {
        // With this configuration, is no longer needed to specify the @Type in the attributes of the DTOs
        enableImplicitConversion: true,
      },
      exceptionFactory: () => {
        return new ApiError(
          HttpStatus.BAD_REQUEST,
          'BAD_REQUEST',
          'Invalid data',
        );
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setup(app);
  await app.listen(PORT);
}
bootstrap();

export { bootstrap, setup };
