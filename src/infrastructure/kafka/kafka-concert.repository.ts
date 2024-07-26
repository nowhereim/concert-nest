import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';
import { TopicEnum } from './base/TopicEnum';

@Injectable()
export class KafkaConcertRepositoryTest extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [TopicEnum.reservationSeat];
  }

  async sendMessageToReservationSeat(data: any) {
    return this.sendMessage(TopicEnum.reservationSeat, 'key', data);
  }
}
