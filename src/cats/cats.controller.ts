import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { UpdateCatDto } from './dtos/update-cat.dto';
import { CreateCatDto } from './dtos/create-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(@Query() paginationQuery?) {
    console.log(
      `This action returns all documents. Limit ${paginationQuery?.limit}, offset: ${paginationQuery?.offset}`,
    );
    return this.catsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns #${id} document`;
  }

  @Post()
  create(@Body() body: CreateCatDto) {
    return body;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCatDto) {
    return `This action updates #${id} document with body ${body}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes #${id} document`;
  }
}
