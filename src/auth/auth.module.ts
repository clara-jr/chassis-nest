import { Module, DynamicModule } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({})
export class AuthModule {
  static forRoot(options: Record<string, any>): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        {
          provide: 'JWT_CONFIG',
          useValue: options,
        },
        AuthService,
      ],
      exports: [AuthService],
    };
  }
}
