import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Connection } from 'mongoose';

import { CatsService } from '../cats.service';
import { CatsModule } from '../cats.module';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CatsRepository } from '../cats.repository';

describe('CatsService', () => {
  let service: CatsService;
  let catRepository: CatsRepository;
  let connection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: process.env.MONGODB_URI,
          }),
        }),
        CatsModule,
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    catRepository = module.get<CatsRepository>(CatsRepository);
    connection = await module.get(getConnectionToken());
  });

  afterEach(async () => {
    await catRepository.deleteMany({});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all documents in database', async () => {
    const index = '123456789123456789123456';
    await catRepository.create({ index }); // insert test data into the database
    const result = await service.findAll({} as PaginationQueryDto);
    expect(result).toHaveLength(1);
    expect(result[0].index.toString()).toEqual(index);
  });
});
