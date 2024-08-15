import { Injectable } from '@nestjs/common';
import { PaymentFacadeApp } from 'src/application/payment/payment.facade';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class ReservationCompleteFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly paymentFacadeApp: PaymentFacadeApp) {
    super(
      ConsumerGroup.COMPLETE_RESERVATION_FAILED_HANDLER_GROUP,
      ConsumerType.COMPLETE_RESERVATION_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.paymentFacadeApp.failPayment({
      transactionId: message.transactionId,
    });
  }
}
