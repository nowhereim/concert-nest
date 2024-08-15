import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer.enum';
import { IReservationOutboxWriter } from 'src/domain/events/interface/reservation-outbox-reader.interface';

@Injectable()
export class PaymentCompleteFailEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IReservationOutboxWriter')
    private readonly reservationOutboxWriter: IReservationOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.PAYMENT_OUTBOX_MARKER_GROUP,
      ConsumerType.PAYMENT_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.reservationOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.SEAT_RESERVATION_FAILED,
    });
  }
}
