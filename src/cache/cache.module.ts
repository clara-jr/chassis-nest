import { Module, Global } from '@nestjs/common';
import CacheService from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useFactory: async () => {
        const config = {
          uri: process.env.REDIS_URI,
        };
        return CacheService.bootstrap(config);
      },
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
