import { Injectable, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { ApiError } from '../common/filters/http-exception.filter';
import CacheService from '../cache/cache.service';

@Injectable()
export default class AuthService {
  private sessionTTL: number = 60 * 60; // session expires in 1 h
  private jwtOptions: object = {
    // To eliminate the need for a refresh token, we do not set a token expiration (expiresIn). Instead, we verify the existence of a Redis session.
    audience: 'chassis-nest',
    issuer: 'chassis-nest',
  };
  private jwtSecret: string;
  private uuidNamespace: string;

  constructor(
    @Inject('JWT_CONFIG') private config: Record<string, any>,
    private readonly cacheService: CacheService,
  ) {
    this.jwtSecret = config.jwtSecret || '';
    this.uuidNamespace = config.uuidNamespace || '';
  }

  async verifyToken(jwToken: string | undefined) {
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
    return JSON.parse(sessionData);
  }

  async createToken(sessionData: object) {
    const jti = uuidv5(uuidv4(), this.uuidNamespace);
    const tokenData = {
      jti,
    };
    const token = jwt.sign(tokenData, this.jwtSecret, this.jwtOptions);
    await this.cacheService.setex(
      `chassis-session:${jti}`,
      sessionData,
      this.sessionTTL,
    );
    return token;
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
