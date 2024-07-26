import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';
import { TopicEnum } from './base/TopicEnum';

@Injectable()
export class KafkaUserRepositoryTest extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [TopicEnum.cashCharge, TopicEnum.cashUse];
  }

  async sendMessageToCashCharge(data: any) {
    return this.sendMessage(TopicEnum.cashCharge, 'key', data);
  }

  async sendMessageToCashUse(data: any) {
    return this.sendMessage(TopicEnum.cashUse, 'key', data);
  }
}
