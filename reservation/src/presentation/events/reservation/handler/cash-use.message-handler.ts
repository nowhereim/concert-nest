import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer.enum';

@Injectable()
export class CashUseEventHandler extends KafkaBaseConsumer {
  constructor(private readonly reservationFacadeApp: ReservationFacadeApp) {
    super(ConsumerGroup.CASH_USE_HANDLER_GROUP, ConsumerType.CASH_USE);
  }
  async handleMessage(message: any): Promise<void> {
    await this.reservationFacadeApp.completeReservation({
      userId: message.after.id,
      transactionId: message.transactionId,
    });
  }
}
