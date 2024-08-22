import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer.enum';

@Injectable()
export class PaymentCompleteFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly reservationFacadeApp: ReservationFacadeApp) {
    super(ConsumerGroup.PAYMENT_HANDLER_GROUP, ConsumerType.PAYMENT_FAILED);
  }
  async handleMessage(message: any): Promise<void> {
    await this.reservationFacadeApp.failReservation({
      transactionId: message.transactionId,
    });
  }
}
