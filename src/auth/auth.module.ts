import { Module, DynamicModule } from '@nestjs/common';
import AuthService from './auth.service';
import JwtService from './jwt.service';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';

@Module({})
export class AuthModule {
  static forRoot(options: Record<string, any>): DynamicModule {
    return {
      module: AuthModule,
      controllers: [AuthController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        {
          provide: 'AUTH_CONFIG',
          useValue: options,
        },
        JwtService,
        AuthService,
      ],
      exports: [JwtService],
    };
  }
}
