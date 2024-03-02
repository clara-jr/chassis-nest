import { Injectable, NotFoundException } from '@nestjs/common';
import { Cat } from './cats.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  findAll() {
    return this.catModel.find().exec();
  }

  findOne(id: string) {
    const cat = this.catModel.findOne({ _id: id }).exec();
    if (!cat) {
      throw new NotFoundException(`Cat #${id} not found`);
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
      throw new NotFoundException(`Cat #${id} not found`);
    }
    return existingCat;
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    return cat.deleteOne();
  }
}
