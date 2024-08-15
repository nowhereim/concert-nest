import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConcertFacadeApp } from 'src/application/concert/concert.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class ExpiredReservationMessageHandler extends KafkaBaseConsumer {
  constructor(private readonly concertFacadeApp: ConcertFacadeApp) {
    super(
      ConsumerGroup.RESERVATION_EXPIRE_HANDLER_GROUP,
      ConsumerType.RESERVATIONS_EXPIRED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.concertFacadeApp.seatsActivate({
      reservation: message.after,
    });
  }
}
