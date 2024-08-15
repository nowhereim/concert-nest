import { Injectable } from '@nestjs/common';
import { UserFacadeApp } from 'src/application/user/user.facade';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class PaymentCompleteFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly userFacadeApp: UserFacadeApp) {
    super(
      ConsumerGroup.PAYMENT_FAILED_HANDLER_GROUP,
      ConsumerType.PAYMENT_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.userFacadeApp.rollbackCashUse({
      transactionId: message.transactionId,
    });
  }
}
