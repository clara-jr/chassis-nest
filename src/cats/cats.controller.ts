import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { createCatSchema } from './schemas/create-cat.schema';
import { updateCatSchema } from './schemas/update-cat.schema';
import { JwtUser, JwtUserType } from 'src/common/decorators/jwtUser.decorator';
import { paginationQuerySchema } from 'src/common/schemas/pagination-query.schema';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodPipe } from 'src/common/pipes/zod.pipe';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(
    @Query(new ZodPipe(paginationQuerySchema)) paginationQuery,
    @JwtUser() jwtUser: JwtUserType,
  ) {
    console.log(
      `This action returns all documents for user ${jwtUser.userName}. Limit ${paginationQuery?.limit}, offset: ${paginationQuery?.offset}`,
    );
    return this.catsService.findAll(paginationQuery);
  }

  @ApiResponse({ status: 404, description: 'NOT_FOUND' })
  @Get(':id')
  findOne(@Param('id') id: string, @JwtUser() jwtUser: JwtUserType) {
    console.log(
      `This action returns #${id} document for user ${jwtUser.userName}`,
    );
    return this.catsService.findOne(id);
  }

  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND' })
  @Post()
  create(
    @Body(new ZodPipe(createCatSchema)) body,
    @JwtUser() jwtUser: JwtUserType,
  ) {
    console.log(
      `This action creates document with body ${body} for user ${jwtUser.userName}`,
    );
    return this.catsService.create(body);
  }

  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodPipe(updateCatSchema)) body,
    @JwtUser() jwtUser: JwtUserType,
  ) {
    console.log(
      `This action updates #${id} document with body ${body} for user ${jwtUser.userName}`,
    );
    return this.catsService.update(id, body);
  }

  @ApiResponse({ status: 404, description: 'NOT_FOUND' })
  @Delete(':id')
  remove(@Param('id') id: string, @JwtUser() jwtUser: JwtUserType) {
    console.log(
      `This action removes #${id} document for user ${jwtUser.userName}`,
    );
    return this.catsService.remove(id);
  }
}
