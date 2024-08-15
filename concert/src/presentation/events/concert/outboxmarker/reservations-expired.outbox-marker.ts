import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { IConcertOutboxWriter } from 'src/domain/events/interface/concert-outbox-writer.interface';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';

@Injectable()
export class ExpiredReservationOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IConcertOutboxWriter')
    private readonly concertOutboxWriter: IConcertOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.RESERVATION_EXPIRE_OUTBOX_MARKER_GROUP,
      ConsumerType.RESERVATIONS_EXPIRED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.concertOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.RESERVATIONS_EXPIRED,
    });
  }
}
