import { EventType } from 'src/domain/events/event.dispatcher';
import { EntityManager } from 'typeorm';

export interface IPaymentOutboxWriter {
  save(
    args: {
      event: any;
      eventType: EventType;
      transactionId: string;
    },
    transactionalEntityManager?: EntityManager,
  ): Promise<void>;

  updateSuccess(
    args: { transactionId: string; eventType: any },
    transactionalEntityManager?: EntityManager,
  ): Promise<void>;
}
