import { Injectable } from '@nestjs/common';
import { KafkaBaseProducer } from 'src/infrastructure/kafka/base/kafka.base.producer';
import { TopicEnum } from './base/TopicEnum';

@Injectable()
export class KafkaQueueRepositoryImpl extends KafkaBaseProducer {
  setTopics(): void {
    this.topics = [TopicEnum.test];
  }

  async sendMessageToActiveToken(data: any) {
    const getInfo = await this.sendMessage(TopicEnum.test, 'key', data);
    return getInfo;
  }
}
