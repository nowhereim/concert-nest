import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { QueueFacadeApp } from '../../../application/queue/queue.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class ExpireQueueMessageHandler extends KafkaBaseConsumer {
  constructor(private readonly queueFacadeApp: QueueFacadeApp) {
    super(ConsumerGroup.EXPIRE_TOKEN_HANDLER_GROUP, ConsumerType.EXPIRE_TOKENS);
  }

  async handleMessage(message: any): Promise<void> {
    await this.queueFacadeApp.expireToken({ userId: message.after.userId });
  }
}
