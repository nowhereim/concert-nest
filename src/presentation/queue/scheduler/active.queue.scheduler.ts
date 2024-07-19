import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueFacadeApp } from 'src/application/queue/queue.facade(app)';

@Injectable()
export class ActiveQueueScheduler {
  constructor(private readonly queueFacade: QueueFacadeApp) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    await this.queueFacade.activeQueue();
  }
}
