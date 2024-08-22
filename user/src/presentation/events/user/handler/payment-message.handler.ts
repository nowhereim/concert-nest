import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { UserFacadeApp } from 'src/application/user/user.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class PaymentEventHandler extends KafkaBaseConsumer {
  constructor(private readonly userFacadeApp: UserFacadeApp) {
    super(ConsumerGroup.PAYMENT_HANDLER_GROUP, ConsumerType.PAYMENT);
  }
  async handleMessage(message: any): Promise<void> {
    await this.userFacadeApp.cashUse({
      userId: message.after.userId,
      amount: message.after.totalAmount,
      transactionId: message.transactionId,
    });
  }
}
