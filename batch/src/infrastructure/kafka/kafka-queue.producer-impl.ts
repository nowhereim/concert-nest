import { Injectable } from '@nestjs/common';
import { EventType } from 'src/application/batch';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';

@Injectable()
export class KafkaBatchProducer extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [
      EventType.ACTIVE_QUEUE_JOB,
      EventType.OUTBOX_CLEANUP_JOB,
      EventType.OUTBOX_REPROCESS_JOB,
      EventType.RESERVATION_EXPIRE_JOB,
    ];
  }

  async publishEvent(args: { event: any; type: any }) {
    const getInfo = await this.sendMessage(args.type, null, args.event);
    return getInfo;
  }
}
