import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Server } from 'http';

import { setup, stop } from 'src/app';
import JwtService from 'src/auth/jwt.service';
import { AppModule, closeInMongodConnection } from 'src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let jwtService: JwtService;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setup(app);
    await app.init();

    jwtService = module.get<JwtService>(JwtService);
    server = app.getHttpServer();
    ({ accessToken, refreshToken } = await jwtService.createToken({
      userName: 'test',
    }));
  });

  afterAll(async () => {
    await jwtService.clearSessionData(accessToken);
    await stop(app);
    await closeInMongodConnection();
  });

  describe('POST /auth/login', () => {
    describe('when userName or password are invalid', () => {
      it('should respond with 401 UNAUTHORIZED when userName or password are invalid', async () => {
        const res = await request(server)
          .post('/auth/login')
          .send({ userName: 'invalid', password: 'invalid' })
          .expect(401);
        expect(res.error).toBeDefined;
        expect(res.body.errorCode).toEqual('UNAUTHORIZED');
      });
    });
    describe('when userName and password are valid', () => {
      it('should respond with 200 OK', async () => {
        const res = await request(server)
          .post('/auth/login')
          .send({
            userName: process.env.USERNAME,
            password: process.env.PASSWORD,
          })
          .expect(200);
        const cookies = Array.isArray(res.headers['set-cookie'])
          ? res.headers['set-cookie']
          : [];
        expect(cookies).toHaveLength(2);
        expect(
          cookies
            .find((cookie) => cookie.startsWith('accessToken'))
            .split(';')[0]
            .split('=')[1],
        ).toBeDefined;
        expect(
          cookies
            .find((cookie) => cookie.startsWith('refreshToken'))
            .split(';')[0]
            .split('=')[1],
        ).toBeDefined;
      });
    });
  });

  describe('POST /auth/refresh', () => {
    describe('when refreshToken is invalid', () => {
      it('should respond with 401 UNAUTHORIZED', async () => {
        const res = await request(server)
          .post('/auth/refresh')
          .set('Cookie', ['refreshToken=invalid'])
          .expect(401);
        expect(res.error).toBeDefined;
        expect(res.body.errorCode).toEqual('UNAUTHORIZED');
      });
    });
    describe('when refreshToken is valid', () => {
      it('should respond with 200 OK', async () => {
        const res = await request(server)
          .post('/auth/refresh')
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(200);
        const cookies = Array.isArray(res.headers['set-cookie'])
          ? res.headers['set-cookie']
          : [];
        expect(cookies).toHaveLength(2);
        expect(
          cookies
            .find((cookie) => cookie.startsWith('accessToken'))
            .split(';')[0]
            .split('=')[1],
        ).toBeDefined;
        expect(
          cookies
            .find((cookie) => cookie.startsWith('refreshToken'))
            .split(';')[0]
            .split('=')[1],
        ).toBeDefined;
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully and clear cookies', async () => {
      const res = await request(server)
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`]);
      expect(res.status).toEqual(200);
      const cookies = Array.isArray(res.headers['set-cookie'])
        ? res.headers['set-cookie']
        : [];
      expect(cookies).toHaveLength(2);
      cookies.forEach((cookie) => {
        if (
          cookie.startsWith('accessToken') ||
          cookie.startsWith('refreshToken')
        ) {
          expect(cookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        }
      });
    });
  });
});
