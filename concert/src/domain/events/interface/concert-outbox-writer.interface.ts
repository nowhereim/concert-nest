import { EventType } from 'src/domain/events/event.dispatcher';
export interface IConcertOutboxWriter {
  save(
    args: {
      event: any;
      eventType: EventType;
      transactionId: string;
    },
    transactionalEntityManager?: any,
  ): Promise<void>;

  updateSuccess(
    args: { transactionId: string; eventType: any },
    transactionalEntityManager?: any,
  ): Promise<void>;
}
