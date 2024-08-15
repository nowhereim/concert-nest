import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomLogger } from 'src/common/logger/logger';
import { KafkaBatchProducer } from 'src/infrastructure/kafka/kafka-queue.producer-impl';

export enum EventType {
  ACTIVE_QUEUE_JOB = 'ACTIVE_QUEUE_TOKEN',
  OUTBOX_CLEANUP_JOB = 'OUTBOX_CLEANUP',
  OUTBOX_REPROCESS_JOB = 'OUTBOX_REPROCESS',
  RESERVATION_EXPIRE_JOB = 'RESERVATION_EXPIRE',
}

@Injectable()
export class Scheduler {
  constructor(
    private readonly kafkaBatchProducer: KafkaBatchProducer,
    private readonly customLogger: CustomLogger,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async activeQueueJob() {
    try {
      await this.kafkaBatchProducer.publishEvent({
        event: { message: 'batch-processing' },
        type: EventType.ACTIVE_QUEUE_JOB,
      });
    } catch (e) {
      this.customLogger.logError({ message: e.message, stack: e.stack });
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async outboxCleanupJob() {
    try {
      await this.kafkaBatchProducer.publishEvent({
        event: { message: 'batch-processing' },
        type: EventType.OUTBOX_CLEANUP_JOB,
      });
    } catch (e) {
      this.customLogger.logError({ message: e.message, stack: e.stack });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async outboxReprocessJob() {
    try {
      await this.kafkaBatchProducer.publishEvent({
        event: { message: 'batch-processing' },
        type: EventType.OUTBOX_REPROCESS_JOB,
      });
    } catch (e) {
      this.customLogger.logError({ message: e.message, stack: e.stack });
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async reservationExpireJob() {
    try {
      await this.kafkaBatchProducer.publishEvent({
        event: { message: 'batch-processing' },
        type: EventType.RESERVATION_EXPIRE_JOB,
      });
    } catch (e) {
      this.customLogger.logError({ message: e.message, stack: e.stack });
    }
  }
}
