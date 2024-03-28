import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';

import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Cat } from './cats.entity';
import { setup } from 'src/main';

describe('CatsController (e2e)', () => {
  let app: INestApplication;
  let catModel: Model<Cat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setup(app);
    await app.init();

    catModel = module.get<Model<Cat>>(getModelToken(Cat.name));
  });

  afterEach(async () => {
    await catModel.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const index = '123456789123456789123456';
    await catModel.create([{ index }]); // insert test data into the database
    const result = await request(app.getHttpServer()).get('/cats').expect(200);
    expect(result.body).toHaveLength(1);
    expect(result.body[0].index.toString()).toEqual(index);
  });

  it('/ (POST) 400 BAD_REQUEST', async () => {
    const index = 'invalid';
    await request(app.getHttpServer()).post('/cats').send({}).expect(400); // DTO validation error
    await request(app.getHttpServer())
      .post('/cats')
      .send({ index })
      .expect(400); // Mongoose schema validation error
  });
});
