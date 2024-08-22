import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer.enum';

@Injectable()
export class SeatReservationSuccessEventHandler extends KafkaBaseConsumer {
  constructor(private readonly reservationFacadeApp: ReservationFacadeApp) {
    super(
      ConsumerGroup.SEAT_RESERVATION_SUCCESS_HANDLER_GROUP,
      ConsumerType.SEAT_RESERVATION_SUCCESS,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.reservationFacadeApp.reservationOccupied({
      seatId: message.args.seatId,
      transactionId: message.after,
    });
  }
}
