import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IPaymentOutboxWriter } from 'src/domain/events/interface/payment-outbox-writer.interface';

@Injectable()
export class CashUseFailEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IPaymentOutboxWriter')
    private readonly paymentOutboxWriter: IPaymentOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.CASH_USE_OUTBOX_MARKER_GROUP,
      ConsumerType.CASH_USE_FAILED,
    );
  }

  async handleMessage(message: any): Promise<void> {
    await this.paymentOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.CASH_USE_FAILED,
    });
  }
}
