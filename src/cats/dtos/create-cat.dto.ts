import { IsNumber, IsString } from 'class-validator';

export class CreateCatDto {
  @IsString()
  readonly string: string;
  @IsNumber()
  readonly number: number;
  @IsString({ each: true })
  readonly stringsArray: string[];
}
