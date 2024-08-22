import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer.enum';

@Injectable()
export class ReservationExpireMessageHandler extends KafkaBaseConsumer {
  constructor(private readonly reservationFacadeApp: ReservationFacadeApp) {
    super(
      ConsumerGroup.RESERVATION_EXPIRE_HANDLER_GROUP,
      ConsumerType.RESERVATION_EXPIRE,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.reservationFacadeApp.expireAllExpiredReservations();
  }
}
