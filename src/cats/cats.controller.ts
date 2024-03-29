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
import { JwtUser, JwtUserType } from 'src/decorators/jwtUser.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @JwtUser() jwtUser: JwtUserType,
  ) {
    console.log(
      `This action returns all documents for user ${jwtUser.userName}. Limit ${paginationQuery?.limit}, offset: ${paginationQuery?.offset}`,
    );
    return this.catsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @JwtUser() jwtUser: JwtUserType) {
    console.log(
      `This action returns #${id} document for user ${jwtUser.userName}`,
    );
    return this.catsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateCatDto, @JwtUser() jwtUser: JwtUserType) {
    console.log(
      `This action creates document with body ${body} for user ${jwtUser.userName}`,
    );
    return this.catsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCatDto,
    @JwtUser() jwtUser: JwtUserType,
  ) {
    console.log(
      `This action updates #${id} document with body ${body} for user ${jwtUser.userName}`,
    );
    return this.catsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @JwtUser() jwtUser: JwtUserType) {
    console.log(
      `This action removes #${id} document for user ${jwtUser.userName}`,
    );
    return this.catsService.remove(id);
  }
}
