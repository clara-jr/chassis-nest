import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import JwtService from './jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private unprotectedRoutes: string;
  constructor(
    @Inject('AUTH_CONFIG') private config: Record<string, any>,
    private readonly jwtService: JwtService,
  ) {
    this.unprotectedRoutes = config.unprotectedRoutes || '';
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const unprotectedRoutes = this.unprotectedRoutes.split(',') || [];
    if (unprotectedRoutes.includes(req.path)) return true;
    const token = req.cookies?.accessToken;
    const { sessionData: jwtUser } = await this.jwtService.verifyToken(token);
    interface CustomRequest extends Request {
      jwtUser: { userName: string };
    }
    (req as CustomRequest).jwtUser = jwtUser;
    return true;
  }
}
