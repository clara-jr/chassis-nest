import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import {
  ApiError,
  HttpExceptionFilter,
} from './common/middlewares/http-exception.filter';

const PORT = process.env.PORT || 8080;

function setup(app) {
  app.use(helmet()); // set HTTP response headers
  app.use(json()); // for parsing application/json
  app.enableCors(); // enable CORS
  app.use(cookieParser()); // set req.cookies
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
          'VALIDATION_ERROR',
          'Invalid data',
        );
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}

async function stop(app) {
  await app.close();
  console.info('👋 Express server stopped');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setup(app);

  // Set openapi documentation
  const options = new DocumentBuilder()
    .setTitle('chassis-nest')
    .setDescription(
      'Chassis for a REST API using NestJS, Express.js, MongoDB and Redis',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('openapi', app, document);

  // Start Express server
  await app.listen(PORT);
  console.info(`✅ Express server listening at port: ${PORT}`);

  // Docker stop
  process.on('SIGTERM', async () => {
    await stop(app);
    process.exit(0);
  });

  // Ctrl-C
  process.on('SIGINT', async () => {
    await stop(app);
    process.exit(0);
  });

  // Nodemon restart
  process.on('SIGUSR2', async () => {
    await stop(app);
    process.exit(0);
  });
}
bootstrap();

export { bootstrap, setup, stop };
