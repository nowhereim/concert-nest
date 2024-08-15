import { EventType } from 'src/domain/events/event.dispatcher';
import { EntityManager } from 'typeorm';
import { Outbox } from 'src/domain/events/outbox';

export interface IUserOutboxReader {
  findByTransactionId(
    args: { transactionId: string; eventType: EventType },
    transactionalEntityManager?: EntityManager,
  ): Promise<Outbox>;
}
