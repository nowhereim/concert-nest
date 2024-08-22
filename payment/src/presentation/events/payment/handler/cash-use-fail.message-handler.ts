import { Injectable } from '@nestjs/common';
import { PaymentFacadeApp } from 'src/application/payment/payment.facade';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class CashUseFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly paymentFacadeApp: PaymentFacadeApp) {
    super(ConsumerGroup.CASH_USE_HANDLER_GROUP, ConsumerType.CASH_USE_FAILED);
  }

  async handleMessage(message: any): Promise<void> {
    await this.paymentFacadeApp.failPayment({
      transactionId: message.transactionId,
    });
  }
}
