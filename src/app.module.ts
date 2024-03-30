import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { CatsModule } from './cats/cats.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { HttpRequestLoggerMiddleware } from './common/middlewares/http-request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
    }),
    CacheModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    AuthModule,
    CatsModule,
  ], // Any exported providers of these imported modules are now fully available here as well.
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    process.env.NODE_ENV !== 'test' &&
      consumer
        .apply(HttpRequestLoggerMiddleware)
        // do not log this call, too much flood
        .exclude('openapi')
        .forRoutes('*');
  }
}
