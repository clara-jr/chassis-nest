import { Injectable, NotFoundException } from '@nestjs/common';
import { Cat } from './cats.entity';

@Injectable()
export class CatsService {
  private cats: Cat[] = [
    {
      string: 'string',
      number: 1,
      boolean: true,
      date: new Date(),
    },
  ];

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: string) {
    const cat = this.cats.find((item) => item.id === +id);
    if (!cat) {
      throw new NotFoundException(`Cat #${id} not found`);
    }
    return cat;
  }

  create(createCatDto: any) {
    this.cats.push(createCatDto);
  }

  update(id: string, updateCatDto: any) {
    const existingCat = this.findOne(id);
    if (existingCat) {
      // update the existing entity
    }
  }

  remove(id: string) {
    const catIndex = this.cats.findIndex((item) => item.id === +id);
    if (catIndex >= 0) {
      this.cats.splice(catIndex, 1);
    }
  }
}
