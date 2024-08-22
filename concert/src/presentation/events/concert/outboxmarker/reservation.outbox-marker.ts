import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IConcertOutboxWriter } from 'src/domain/events/interface/concert-outbox-writer.interface';

@Injectable()
export class ReservationEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IConcertOutboxWriter')
    private readonly concertOutboxWriter: IConcertOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.RESERVATION_SEAT_OUTBOX_MARKER_GROUP,
      ConsumerType.RESERVATION_SEAT,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.concertOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.RESERVATION_SEAT,
    });
  }
}
