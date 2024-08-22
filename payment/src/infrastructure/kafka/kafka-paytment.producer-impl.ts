import { Injectable } from '@nestjs/common';
import { EventType } from 'src/domain/events/event.dispatcher';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';

@Injectable()
export class KafkaPaymentProducerImpl extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [EventType.PAYMENT, EventType.PAYMENT_COMPLETED];
  }

  async publishEvent(args: { event: any; type: EventType }) {
    const getInfo = await this.sendMessage(args.type, null, args.event);
    return getInfo;
  }
}
