import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '../../../common/logger/logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private customLogger = new CustomLogger();
  constructor() {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus() || 500;

    const error = exception.getResponse() as
      | {
          message: string;
          cause: string;
        }
      | {
          error: string;
          statusCode: number;
          message: string | string[];
          timestamp: string;
          path: string;
          cause: string;
        };

    this.customLogger.logError({
      message: error.cause ? error.cause : error.message,
      stack: exception.stack,
    });

    const typech = typeof error === 'string';
    const metaData = {
      statusCode: status,
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(status).json({
      ...metaData,
      error: typech ? error : error.message,
    });
  }
}
