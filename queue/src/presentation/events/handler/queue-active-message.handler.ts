import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';

@Injectable()
export class ActiveQueueMessageHandler extends KafkaBaseConsumer {
  constructor(private readonly queueFacadeApp: QueueFacadeApp) {
    super(
      ConsumerGroup.ACTIVE_QUEUE_TOKEN_HANDLER_GROUP,
      ConsumerType.ACTIVE_QUEUE_TOKEN,
    );
  }

  async handleMessage(message: any): Promise<void> {
    await this.queueFacadeApp.activateWaitingRecords();
  }
}
