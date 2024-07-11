import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueFacadeApp } from 'src/application/queue/queue.facade(app)';

@Injectable()
export class ExpireQueueScheduler {
  constructor(private readonly queueFacade: QueueFacadeApp) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    await this.queueFacade.expireQueue();
  }
}
