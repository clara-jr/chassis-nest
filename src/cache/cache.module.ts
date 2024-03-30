import { Module, Global, DynamicModule } from '@nestjs/common';
import CacheService from './cache.service';

@Global()
@Module({})
export class CacheModule {
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<{ uri: string }> | { uri: string };
    inject?: any[];
  }): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: 'REDIS_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: CacheService,
          useFactory: async (options) => {
            return CacheService.bootstrap(options);
          },
          inject: ['REDIS_CONFIG'],
        },
      ],
      exports: [CacheService],
    };
  }
}
