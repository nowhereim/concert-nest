import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IConcertOutboxWriter } from 'src/domain/events/interface/concert-outbox-writer.interface';

@Injectable()
export class PaymentFailEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IConcertOutboxWriter')
    private readonly concertOutboxWriter: IConcertOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.PAYMENT_FAILED_OUTBOX_MARKER_GROUP,
      ConsumerType.PAYMENT_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.concertOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.PAYMENT_FAILED,
    });
  }
}
