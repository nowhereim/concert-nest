import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';
import { EventType } from 'src/domain/events/event.dispatcher';

@Injectable()
export class KafkaUserProducerImpl extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [EventType.CASH_USE, EventType.CASH_CHARGE];
  }

  async publishEvent(args: { event: any; type: EventType }) {
    const getInfo = await this.sendMessage(args.type, null, args.event);
    return getInfo;
  }
}
