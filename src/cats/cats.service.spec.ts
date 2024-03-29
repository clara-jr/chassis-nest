import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { Model } from 'mongoose';
import { CatsService } from './cats.service';
import { Cat } from './cats.entity';
import { CatsModule } from './cats.module';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

describe('CatsService', () => {
  let service: CatsService;
  let catModel: Model<Cat>;

  beforeEach(async () => {
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
    catModel = module.get<Model<Cat>>(getModelToken(Cat.name));
  });

  afterEach(async () => {
    await catModel.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all documents in database', async () => {
    const index = '123456789123456789123456';
    await catModel.create([{ index }]); // insert test data into the database
    const result = await service.findAll({} as PaginationQueryDto);
    expect(result).toHaveLength(1);
    expect(result[0].index.toString()).toEqual(index);
  });
});
