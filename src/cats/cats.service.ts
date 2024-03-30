import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dtos/create-cat.dto';
import { UpdateCatDto } from './dtos/update-cat.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { NotFoundError } from 'src/common/filters/http-exception.filter';
import { CatsRepository } from './cats.repository';

@Injectable()
export class CatsService {
  constructor(private readonly catsRepository: CatsRepository) {}

  findAll(paginationQuery?: PaginationQueryDto) {
    return this.catsRepository.find({}, paginationQuery);
  }

  async findOne(id: string) {
    const cat = await this.catsRepository.findById(id);
    if (!cat) {
      throw new NotFoundError(`Cat #${id} not found`);
    }
    return cat;
  }

  create(createCatDto: CreateCatDto) {
    return this.catsRepository.create(createCatDto);
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const cat = await this.catsRepository.findByIdAndUpdate(
      id,
      { $set: updateCatDto },
      { new: true },
    );
    if (!cat) {
      throw new NotFoundError(`Cat #${id} not found`);
    }
    return cat;
  }

  async remove(id: string) {
    const cat = await this.catsRepository.findByIdAndDelete(id);
    if (!cat) {
      throw new NotFoundError(`Cat #${id} not found`);
    }
    return cat;
  }
}
