import { EntityManager } from 'typeorm';

export interface IQueueOutboxWriter {
  updateSuccess(
    args: { transactionId: string; eventType: any },
    transactionalEntityManager?: EntityManager,
  ): Promise<void>;
}
