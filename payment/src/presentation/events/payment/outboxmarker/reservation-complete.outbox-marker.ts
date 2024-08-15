import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IPaymentOutboxWriter } from 'src/domain/events/interface/payment-outbox-writer.interface';

@Injectable()
export class PaymentEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IPaymentOutboxWriter')
    private readonly paymentOutboxWriter: IPaymentOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.COMPLETE_RESERVATION_OUTBOX_MARKER_GROUP,
      ConsumerType.COMPLETE_RESERVATION,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.paymentOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.COMPLETE_RESERVATION,
    });
  }
}
