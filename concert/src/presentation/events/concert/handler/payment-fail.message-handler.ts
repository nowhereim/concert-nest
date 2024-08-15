import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConcertFacadeApp } from 'src/application/concert/concert.facade';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class PaymentFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly concertFacadeApp: ConcertFacadeApp) {
    super(
      ConsumerGroup.PAYMENT_FAILED_HANDLER_GROUP,
      ConsumerType.PAYMENT_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.concertFacadeApp.seatActivate({
      seatId: message.after.seatNumber,
    });
  }
}
