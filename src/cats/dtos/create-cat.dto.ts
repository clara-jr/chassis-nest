import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCatDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  readonly index: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly string: string;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  readonly number: number;

  @ApiProperty({
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  readonly stringsArray: string[];
}
