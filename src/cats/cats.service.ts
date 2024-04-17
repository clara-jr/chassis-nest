import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './schemas/create-cat.schema';
import { UpdateCatDto } from './schemas/update-cat.schema';
import { PaginationQueryDto } from 'src/common/schemas/pagination-query.schema';
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
