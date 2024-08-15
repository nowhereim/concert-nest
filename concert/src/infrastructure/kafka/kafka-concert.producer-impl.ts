import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';
import { EventType } from 'src/domain/events/event.dispatcher';

@Injectable()
export class KafkaConcertProducerImpl extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [EventType.SEAT_RESERVATION_FAILED];
  }

  async publishEvent(args: { event; type: EventType }) {
    const getInfo = await this.sendMessage(args.type, null, args.event);
    return getInfo;
  }
}
