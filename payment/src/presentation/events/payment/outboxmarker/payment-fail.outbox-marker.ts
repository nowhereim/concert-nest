import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IPaymentOutboxWriter } from 'src/domain/events/interface/payment-outbox-writer.interface';

@Injectable()
export class PaymentFailEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IPaymentOutboxWriter')
    private readonly paymentOutboxWriter: IPaymentOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.PAYMENT_OUTBOX_MARKER_GROUP,
      ConsumerType.PAYMENT_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.paymentOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.PAYMENT_FAILED,
    });
  }
}
