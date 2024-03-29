import { Module, Global } from '@nestjs/common';
import AuthService from './auth.service';
import { CacheModule } from 'src/cache/cache.module';
import CacheService from 'src/cache/cache.service';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [CacheModule],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: AuthService,
      useFactory: async (cacheService: CacheService) => {
        const config = {
          jwtSecret: process.env.JWT_SECRET,
          uuidNamespace: process.env.UUID_NAMESPACE,
        };
        return new AuthService(config, cacheService);
      },
      inject: [CacheService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
