import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import AuthService from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.header('X-Auth-Token');
    const jwtUser = await this.authService.verifyToken(token);
    interface CustomRequest extends Request {
      jwtUser: { userName: string };
    }
    (req as CustomRequest).jwtUser = jwtUser;
    return true;
  }
}
