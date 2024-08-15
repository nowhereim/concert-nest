import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { CustomLogger } from '../../../common/logger/logger';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private customLogger = new CustomLogger();

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const errorResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as
            | { message: string; cause: string }
            | {
                error: string;
                statusCode: number;
                message: string | string[];
                timestamp: string;
                path: string;
                cause: string;
              })
        : { message: (exception as Error).message, cause: '' };

    this.customLogger.logError({
      message: errorResponse.cause
        ? errorResponse.cause
        : errorResponse.message,
      stack: (exception as Error).stack,
    });

    const metaData = {
      statusCode: status,
      success: false,
      timestamp: new Date().toISOString(),
      path: request ? request.url : '',
    };

    if (type === 'http') {
      // HTTP 예외 처리
      response.status(status).json({
        ...metaData,
        error:
          typeof errorResponse === 'string'
            ? errorResponse
            : errorResponse.message,
      });
    } else if (type === 'rpc') {
      // RPC 예외 처리
      console.error('RPC Exception:', errorResponse);
    } else if (type === 'ws') {
      // WebSocket 예외 처리
      console.error('WebSocket Exception:', errorResponse);
    } else {
      console.error('Unknown Exception Type:', errorResponse);
    }
  }
}
