import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueFacadeApp } from 'src/application/queue/queue.facade(app)';

@Injectable()
export class ActiveQueueScheduler {
  constructor(private readonly queueFacade: QueueFacadeApp) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    console.log('ActiveQueueScheduler');
    await this.queueFacade.activeQueue();
  }
}
