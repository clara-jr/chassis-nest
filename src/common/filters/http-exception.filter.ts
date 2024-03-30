import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (
      !(exception instanceof ApiError) &&
      (exception.name === 'ValidationError' || exception.name === 'CastError')
    ) {
      exception = new ApiError(400, 'VALIDATION_ERROR', exception.message);
    }

    const { errorCode = 'UNKNOWN_ERROR', message = 'Unknown error' } =
      exception;
    let { status } = exception;

    // If the status code is outside the 4xx or 5xx range, set it to 500
    if (!Number.isInteger(status) || status < 400 || status > 599) {
      status = 500;
    }

    console.error(`🔴 ERROR with status ${status}: ${errorCode} ${message}`);
    if (status === 500) {
      console.error(exception.stack);
    }

    res.status(status).json({
      status: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}

export class ApiError extends HttpException {
  errorCode: string;

  constructor(
    status = 500,
    errorCode = 'UNKNOWN_ERROR',
    message = 'Api error',
  ) {
    super(message, status);
    this.errorCode = errorCode;
  }
}

export class NotFoundError extends ApiError {
  constructor(message?: any) {
    super(HttpStatus.NOT_FOUND, 'NOT_FOUND', message || 'Document not found');
  }
}
