import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { PaymentFacadeApp } from '../../../../application/payment/payment.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class PaymentFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly paymentFacadeApp: PaymentFacadeApp) {
    super(ConsumerGroup.PAYMENT_HANDLER_GROUP, ConsumerType.PAYMENT_FAILED);
  }
  async handleMessage(message: any): Promise<void> {
    await this.paymentFacadeApp.failPayment({
      transactionId: message.transactionId,
    });
  }
}
