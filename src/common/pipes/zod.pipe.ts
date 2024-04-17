import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { ApiError } from '../filters/http-exception.filter';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        error.message,
      );
    }
  }
}
