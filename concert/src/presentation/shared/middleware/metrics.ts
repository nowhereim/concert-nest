import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly histogram: Histogram<string>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const end = this.histogram.startTimer();
    res.on('finish', () => {
      end({
        method: req.method,
        route: req.route?.path || req.path,
        path: req.path,
      });
    });
    next();
  }
}
