import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class PaymentMessageHandler extends KafkaBaseConsumer {
  constructor(private readonly queueFacadeApp: QueueFacadeApp) {
    super(
      ConsumerGroup.PAYMENT_COMPLETED_HANDLER_GROUP,
      ConsumerType.PAYMENT_COMPLETED,
    );
  }

  async handleMessage(message: any): Promise<void> {
    await this.queueFacadeApp.expireToken({ userId: message.args.userId });
  }
}
