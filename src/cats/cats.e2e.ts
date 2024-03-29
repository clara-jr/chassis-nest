import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';

import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Cat } from './cats.entity';
import { setup } from 'src/main';
import AuthService from 'src/auth/auth.service';

describe('CatsController (e2e)', () => {
  let app: INestApplication;
  let catModel: Model<Cat>;
  let authService: AuthService;
  let token: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setup(app);
    await app.init();

    catModel = module.get<Model<Cat>>(getModelToken(Cat.name));
    authService = module.get<AuthService>(AuthService);
    token = token || (await authService.createToken({ userName: 'test' }));
  });

  afterEach(async () => {
    await catModel.deleteMany();
  });

  afterAll(async () => {
    await authService.clearSessionData(token);
    await app.close();
  });

  describe('GET /', () => {
    describe('when token is invalid', () => {
      it('should respond with 401 UNAUTHORIZED when token is invalid', async () => {
        const res = await request(app.getHttpServer()).get('/cats').expect(401);
        expect(res.error).toBeDefined;
        expect(res.body.errorCode).toEqual('UNAUTHORIZED');
      });
    });
    describe('when token is valid', () => {
      const index = '123456789123456789123456';
      beforeEach(async () => {
        await catModel.create({ index });
      });
      it('should respond with 200 OK', async () => {
        const res = await request(app.getHttpServer())
          .get('/cats')
          .set('X-Auth-Token', `${token}`)
          .expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].index.toString()).toEqual(index);
      });
    });
  });

  describe('POST /', () => {
    describe('when data is invalid', () => {
      it('should respond with 400 VALIDATION_ERROR', async () => {
        const index = 'invalid';
        const res = await request(app.getHttpServer())
          .post('/cats')
          .send({ index })
          .set('X-Auth-Token', `${token}`)
          .expect(400); // Mongoose schema validation error

        expect(res.error).toBeDefined;
        expect(res.body.errorCode).toEqual('VALIDATION_ERROR');
      });
      it('should respond with 400 VALIDATION_ERROR', async () => {
        const res = await request(app.getHttpServer())
          .post('/cats')
          .send({})
          .set('X-Auth-Token', `${token}`)
          .expect(400); // DTO validation error
        expect(res.error).toBeDefined;
        expect(res.body.errorCode).toEqual('VALIDATION_ERROR');
      });
    });
    describe('when data is valid', () => {
      const index = '123456789123456789123456';
      it('should respond with 201 CREATED', async () => {
        const res = await request(app.getHttpServer())
          .post('/cats')
          .send({ index })
          .set('X-Auth-Token', `${token}`)
          .expect(201);
        expect(res.body.index.toString()).toEqual(index);

        const object = await catModel.findOne({ index });
        expect(object?.index.toString()).toEqual(index);
      });
    });
  });

  describe('GET /:id', () => {
    const index = '123456789123456789123456';
    describe('when object does not exist', () => {
      it('should respond with 401 UNAUTHORIZED when token is invalid', async () => {
        const res = await request(app.getHttpServer())
          .get(`/cats/${index}`)
          .set('X-Auth-Token', `${token}`)
          .expect(404);
        expect(res.error).toBeDefined;
        expect(res.body.errorCode).toEqual('NOT_FOUND');
      });
    });
    describe('when object exists', () => {
      let _id;
      beforeEach(async () => {
        ({ _id } = await catModel.create({ index }));
      });
      it('should respond with 200 OK', async () => {
        const res = await request(app.getHttpServer())
          .get(`/cats/${_id}`)
          .set('X-Auth-Token', `${token}`)
          .expect(200);
        expect(res.body).toBeDefined;
        expect(res.body._id.toString()).toEqual(_id.toString());
        expect(res.body.index.toString()).toEqual(index);
      });
    });
  });
});
