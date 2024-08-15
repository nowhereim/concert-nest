import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from './base/kafka.base.producer';
import { EventType } from 'src/domain/events/event-type.enum';

@Injectable()
export class KafkaReservationProducerImpl extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [EventType.ACTIVE_QUEUE_TOKEN, EventType.PAYMENT_COMPLETED];
  }

  async publishEvent(args: { event: any; type: EventType }) {
    const getInfo = await this.sendMessage(args.type, null, args.event);
    return getInfo;
  }
}
