import { Injectable, NestMiddleware } from '@nestjs/common';
import * as morgan from 'morgan';

@Injectable()
export class HttpRequestLoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    morgan(
      '[:date[clf]] :method :url :status :response-time ms - :res[content-length]',
    )(req, res, next);
  }
}
