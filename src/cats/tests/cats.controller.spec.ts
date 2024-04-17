import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatsController } from '../cats.controller';
import { CatsService } from '../cats.service';
import { Cat } from '../cats.entity';
import { PaginationQueryDto } from 'src/common/schemas/pagination-query.schema';
import { JwtUserType } from 'src/common/decorators/jwtUser.decorator';
import { CatsRepository } from '../cats.repository';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        CatsService,
        CatsRepository,
        {
          provide: getModelToken(Cat.name),
          useValue: Model<Cat>,
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return service response', async () => {
    const mockedValue = [];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockedValue);
    const result = await controller.findAll(
      {} as PaginationQueryDto,
      { userName: 'test' } as JwtUserType,
    );
    expect(result).toEqual(mockedValue);
  });
});
