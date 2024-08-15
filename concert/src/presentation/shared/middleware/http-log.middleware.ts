import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from '../../../common/logger/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private customLoggerService: CustomLogger) {}
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers, ip } = req;
    const start = Date.now();

    const requestMessage = `IN REQUEST: ${method} ${originalUrl} ${ip} ${headers['user-agent']}`;

    res.on('finish', () => {
      const { statusCode } = res;
      const delay = Date.now() - start;
      const responseMessage = `OUT RESPONSE: ${method} ${originalUrl} ${statusCode} ${delay}ms`;

      if (delay > 1000) {
        this.customLoggerService.delayHttpWarn(requestMessage);
        this.customLoggerService.delayHttpWarn(responseMessage);
      }

      if (
        String(statusCode).startsWith('4') ||
        String(statusCode).startsWith('5')
      ) {
        this.customLoggerService.HttpError(requestMessage);
        this.customLoggerService.HttpError(responseMessage);
      } else {
      }
    });

    next();
  }
}
