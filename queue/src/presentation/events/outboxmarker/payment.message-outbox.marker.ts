import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IQueueOutboxWriter } from 'src/domain/events/interface/queue-outbox-writer.interface';

@Injectable()
export class PaymentMessageOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IQueueOutboxWriter')
    private readonly queueOutboxWriter: IQueueOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.PAYMENT_COMPLETED_OUTBOX_MARKER_GROUP,
      ConsumerType.PAYMENT_COMPLETED,
    );
  }

  async handleMessage(message: any): Promise<void> {
    await this.queueOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.PAYMENT_COMPLETED,
    });
  }
}
