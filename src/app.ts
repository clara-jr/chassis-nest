import { HttpStatus, ShutdownSignal, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import {
  ApiError,
  HttpExceptionFilter,
} from './common/filters/http-exception.filter';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import CacheService from './cache/cache.service';

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
  const cacheService = app.get(CacheService);
  app.useGlobalInterceptors(new CacheInterceptor(cacheService));
  app.useGlobalFilters(new HttpExceptionFilter());

  // Start listening for shutdown hooks to call app.close to stop Express server automatically
  // This already closes MongoDB connection via MongooseModule
  // and Redis vía CacheService onApplicationShutdown
  app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);
}

async function stop(app) {
  // This already closes MongoDB connection via MongooseModule
  // and Redis vía CacheService onApplicationShutdown
  await app.close();
  console.info('👋 Express server stopped');
}

export { setup, stop };
