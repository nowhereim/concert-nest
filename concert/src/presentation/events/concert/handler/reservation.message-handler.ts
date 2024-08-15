import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConcertFacadeApp } from 'src/application/concert/concert.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class ReservationEventHandler extends KafkaBaseConsumer {
  constructor(private readonly concertFacadeApp: ConcertFacadeApp) {
    super(
      ConsumerGroup.RESERVATION_SEAT_HANDLER_GROUP,
      ConsumerType.RESERVATION_SEAT,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.concertFacadeApp.seatDeactivate({
      seatId: message.after.seatId,
      concertId: message.after.concertId,
      transactionId: message.transactionId,
    });
  }
}
