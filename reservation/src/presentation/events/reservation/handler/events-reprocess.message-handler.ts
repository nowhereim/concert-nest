import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerGroup, ConsumerType } from '../enum/consumer.enum';
import { EventDispatcher } from 'src/domain/events/event.dispatcher';

@Injectable()
export class OutboxReprocessPendingEvents extends KafkaBaseConsumer {
  constructor(private readonly eventDispatcher: EventDispatcher) {
    super(
      ConsumerGroup.REPROCESS_PENDING_EVENTS_GROUP,
      ConsumerType.REPROCESS_PENDING_EVENTS,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.eventDispatcher.reprocessPendingEvents();
  }
}
