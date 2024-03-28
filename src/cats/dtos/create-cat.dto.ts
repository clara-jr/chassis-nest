import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCatDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  readonly index: string;
  @IsString()
  @IsOptional()
  readonly string: string;
  @IsNumber()
  @IsOptional()
  readonly number: number;
  @IsString({ each: true })
  @IsOptional()
  readonly stringsArray: string[];
}
