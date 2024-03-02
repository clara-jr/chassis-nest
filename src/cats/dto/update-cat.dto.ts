import { PartialType } from '@nestjs/mapped-types';
import { CreateCatDto } from './create-cat.dto';

export class UpdateCatDto extends PartialType(CreateCatDto) {
  readonly string?: string;
  readonly number?: number;
  readonly stringsArray?: string[];
}
