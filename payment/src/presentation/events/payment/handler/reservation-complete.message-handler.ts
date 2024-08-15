import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { PaymentFacadeApp } from '../../../../application/payment/payment.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class ReservationCompleteEventHandler extends KafkaBaseConsumer {
  constructor(private readonly paymentFacadeApp: PaymentFacadeApp) {
    super(
      ConsumerGroup.COMPLETE_RESERVATION_HANDLER_GROUP,
      ConsumerType.COMPLETE_RESERVATION,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.paymentFacadeApp.completePayment({
      userId: message.after.userId,
      transactionId: message.transactionId,
    });
  }
}
