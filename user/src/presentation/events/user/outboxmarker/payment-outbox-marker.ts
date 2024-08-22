import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer-type.enum';
import { IUserOutboxWriter } from 'src/domain/events/interface/user-outbox-writer.interface';

@Injectable()
export class PaymentEventOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IUserOutboxWriter')
    private readonly userOutboxWriter: IUserOutboxWriter,
  ) {
    super(OutboxMarkerGroup.PAYMENT_OUTBOX_MARKER_GROUP, ConsumerType.PAYMENT);
  }
  async handleMessage(message: any): Promise<void> {
    await this.userOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.PAYMENT,
    });
  }
}
