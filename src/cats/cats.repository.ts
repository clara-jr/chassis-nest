import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Cat } from './cats.entity';
import { EntityRepository } from 'src/common/repositories/entity.repository';

@Injectable()
export class CatsRepository extends EntityRepository<Cat> {
  constructor(@InjectModel(Cat.name) catModel: Model<Cat>) {
    super(catModel);
  }
}
