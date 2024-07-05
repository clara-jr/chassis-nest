import {
  Controller,
  Post,
  Body,
  Request,
  Response,
  Inject,
} from '@nestjs/common';
import AuthService from './auth.service';
import { loginSchema } from './schemas/login.schema';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodPipe } from 'src/common/pipes/zod.pipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private accessTokenTTL: number;
  private refreshTokenTTL: number;
  private secure: boolean;

  constructor(
    @Inject('AUTH_CONFIG') private config: Record<string, any>,
    private readonly authService: AuthService,
  ) {
    this.accessTokenTTL = parseInt(config.accessTokenTTL ?? '3600'); // access token expires in 1 hour
    this.refreshTokenTTL = parseInt(config.refreshTokenTTL ?? '86400'); // refresh token expires in 1 day
    this.secure = !['dev', 'test'].includes(process.env.NODE_ENV || '');
  }

  private setCookie(
    @Response() res,
    { accessToken, refreshToken = null },
  ): void {
    const cookieOptions = {
      httpOnly: true, // avoid reading cookie with JavaScript in client side
      secure: this.secure, // send cookie via HTTPS
      sameSite: 'strict' as const, // cookie is only available within the same domain
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 1000 * this.accessTokenTTL, // 1h (in milliseconds)
    });
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * this.refreshTokenTTL, // 1d (in milliseconds)
        path: '/auth/refresh', // avoid sending refreshToken in all requests but 'auth/refresh'
      });
    }
    res.sendStatus(200);
  }

  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @Post('/login')
  async login(@Body(new ZodPipe(loginSchema)) body, @Response() res) {
    const tokens = await this.authService.login(body.userName, body.password);
    this.setCookie(res, tokens);
  }

  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @Post('/refresh')
  async refreshSession(@Request() req, @Response() res) {
    const tokens = await this.authService.refreshSession(
      req.cookies?.refreshToken,
    );
    this.setCookie(res, tokens);
  }

  @Post('/logout')
  logout(@Request() req, @Response() res) {
    this.authService.logout(req.cookies?.accessToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.sendStatus(200);
  }
}
