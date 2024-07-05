import { Injectable, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { ApiError } from '../common/filters/http-exception.filter';
import CacheService from '../cache/cache.service';

interface Session {
  jti: string;
  sessionData: {
    userName: string;
  };
}

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export default class JwtService {
  private jwtOptions: object;
  private jwtSecret: string;
  private uuidNamespace: string;
  private accessTokenTTL: number;
  private refreshTokenTTL: number;
  private sessionTTL: number;

  constructor(
    @Inject('AUTH_CONFIG') private config: Record<string, any>,
    private readonly cacheService: CacheService,
  ) {
    this.jwtSecret = config.jwtSecret || '';
    this.jwtOptions = {
      audience: config.jwtAudience || '',
      issuer: config.jwtIssuer || '',
    };
    this.uuidNamespace = config.uuidNamespace || '';
    this.accessTokenTTL = parseInt(config.accessTokenTTL ?? '3600'); // access token expires in 1 hour
    this.refreshTokenTTL = parseInt(config.refreshTokenTTL ?? '86400'); // refresh token expires in 1 day
    this.sessionTTL = this.refreshTokenTTL; // redis session expires in 1 day (it should be the same expiration as refresh token)
  }

  async verifyToken(jwToken: string | undefined): Promise<Session> {
    if (!jwToken) {
      throw new ApiError(401, 'UNAUTHORIZED', 'No token found.');
    }
    let jti;
    try {
      ({ jti } = jwt.verify(jwToken, this.jwtSecret, this.jwtOptions) as {
        jti: string;
      });
    } catch (error) {
      throw new ApiError(401, 'UNAUTHORIZED', (error as Error).message);
    }
    const sessionData = await this.cacheService.get(`chassis-session:${jti}`);
    if (!sessionData) {
      throw new ApiError(401, 'UNAUTHORIZED', 'No session found.');
    }
    // Extend redis key expiration
    await this.cacheService.setex(
      `chassis-session:${jti}`,
      JSON.parse(sessionData),
      this.sessionTTL,
    );
    return { jti, sessionData: JSON.parse(sessionData) };
  }

  async createToken(
    sessionData: object,
    jti?: string,
    shouldExtendRefreshToken: boolean = true,
  ) {
    jti = jti ?? uuidv5(uuidv4(), this.uuidNamespace);
    const tokenData = {
      jti,
    };
    const accessToken = jwt.sign(tokenData, this.jwtSecret, {
      ...this.jwtOptions,
      expiresIn: this.accessTokenTTL,
    }); // Access token expires in 1h
    if (!shouldExtendRefreshToken) return { accessToken };
    const refreshToken = jwt.sign(tokenData, this.jwtSecret, {
      ...this.jwtOptions,
      expiresIn: this.refreshTokenTTL,
    }); // Refresh token expires in 1d
    await this.cacheService.setex(
      `chassis-session:${jti}`,
      sessionData,
      this.sessionTTL,
    ); // Extend redis key expiration
    return { accessToken, refreshToken };
  }

  async extendToken(refreshToken: string): Promise<Tokens> {
    const { jti, sessionData } = await this.verifyToken(refreshToken);
    // Extend accessToken (and optionally refreshToken to work with larger sessions)
    return this.createToken(sessionData, jti);
  }

  async clearSessionData(jwToken: string) {
    try {
      const { jti } = jwt.verify(jwToken, this.jwtSecret, this.jwtOptions) as {
        jti: string;
      };
      await this.cacheService.del(`chassis-session:${jti}`);
    } catch (_) {
      // Session no longer exists
    }
  }
}
