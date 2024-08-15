import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';
import { EventType } from 'src/domain/events/event.dispatcher';

@Injectable()
export class KafkaReservationProducerImpl extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [
      EventType.RESERVATION_COMPLETED,
      EventType.RESERVATION_CREATED,
    ];
  }

  async publishEvent(args: { event: any; type: EventType }) {
    const getInfo = await this.sendMessage(args.type, null, args.event);
    return getInfo;
  }
}
