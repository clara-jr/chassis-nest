import { ShutdownSignal } from '@nestjs/common';
import { json } from 'express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import CacheService from './cache/cache.service';

function setup(app) {
  app.use(helmet()); // set HTTP response headers
  app.use(json()); // for parsing application/json
  app.enableCors(); // enable CORS
  app.use(cookieParser()); // set req.cookies
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
