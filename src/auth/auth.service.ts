import * as bcrypt from 'bcrypt';
import { Injectable, Inject } from '@nestjs/common';
import { ApiError } from '../common/filters/http-exception.filter';
import JwtService, { Tokens } from './jwt.service';

@Injectable()
export default class AuthService {
  private user: {
    userName: string;
    password: string;
  };

  constructor(
    @Inject('AUTH_CONFIG') private config: Record<string, any>,
    private readonly jwtService: JwtService,
  ) {
    this.user = {
      userName: config.userName,
      password: bcrypt.hashSync(
        process.env.PASSWORD || 'password',
        parseInt(config.saltRound || '10'),
      ),
    };
  }

  async login(userName: string, password: string): Promise<Tokens> {
    const isValid =
      this.user.userName === userName &&
      (await bcrypt.compare(password, this.user.password));
    if (!isValid) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid username or password.');
    }

    return this.jwtService.createToken({ userName });
  }

  async refreshSession(refreshToken: string): Promise<Tokens> {
    return this.jwtService.extendToken(refreshToken);
  }

  async logout(accessToken: string): Promise<void> {
    await this.jwtService.clearSessionData(accessToken);
  }
}
