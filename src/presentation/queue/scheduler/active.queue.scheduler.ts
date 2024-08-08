import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActivateWaitingRecordsUseCase } from 'src/application/queue/usecase/active-waiting-records.use.case';

@Injectable()
export class ActiveQueueScheduler {
  constructor(
    private readonly activateWaitingRecordsUseCase: ActivateWaitingRecordsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.activateWaitingRecordsUseCase.execute();
  }
}
