import { Injectable } from '@nestjs/common';
import { Cat } from './cats.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCatDto } from './dtos/create-cat.dto';
import { UpdateCatDto } from './dtos/update-cat.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { NotFoundError } from 'src/common/middlewares/http-exception.filter';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  findAll(paginationQuery?: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.catModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const cat = await this.catModel.findOne({ _id: id }).exec();
    if (!cat) {
      throw new NotFoundError(`Cat #${id} not found`);
    }
    return cat;
  }

  create(createCatDto: CreateCatDto) {
    const cat = new this.catModel(createCatDto);
    return cat.save();
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const existingCat = await this.catModel
      .findOneAndUpdate({ _id: id }, { $set: updateCatDto }, { new: true })
      .exec();

    if (!existingCat) {
      throw new NotFoundError(`Cat #${id} not found`);
    }
    return existingCat;
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    if (!cat) {
      throw new NotFoundError(`Cat #${id} not found`);
    }
    return cat.deleteOne();
  }
}
