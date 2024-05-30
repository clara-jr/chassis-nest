import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { CatsModule } from './cats/cats.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { HttpRequestLoggerMiddleware } from './common/middlewares/http-request-logger.middleware';

let mongoServer: MongoMemoryServer;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
    }),
    CacheModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.REDIS_URI,
      }),
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        if (process.env.NODE_ENV === 'test') {
          // Start MongoDB in-memory server
          mongoServer = await MongoMemoryServer.create();
          process.env.MONGODB_URI = mongoServer.getUri();
        }
        return {
          uri: process.env.MONGODB_URI,
        };
      },
    }),
    AuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET,
      uuidNamespace: process.env.UUID_NAMESPACE,
    }),
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

export const closeInMongodConnection = async () => {
  if (mongoServer) await mongoServer.stop();
};
