import { Inject, Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerType, OutboxMarkerGroup } from '../enum/consumer.enum';
import { IReservationOutboxWriter } from 'src/domain/events/interface/reservation-outbox-reader.interface';

@Injectable()
export class CashUseEventHandlerOutboxMarker extends KafkaBaseConsumer {
  constructor(
    @Inject('IReservationOutboxWriter')
    private readonly reservationOutboxWriter: IReservationOutboxWriter,
  ) {
    super(
      OutboxMarkerGroup.CASH_USE_OUTBOX_MARKER_GROUP,
      ConsumerType.CASH_USE,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.reservationOutboxWriter.updateSuccess({
      transactionId: message.transactionId,
      eventType: ConsumerType.CASH_USE,
    });
  }
}
