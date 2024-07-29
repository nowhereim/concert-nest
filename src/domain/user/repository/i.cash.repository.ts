import { EntityManager, UpdateResult } from 'typeorm';
import { User } from '../models/user';
import { Cash } from '../models/cash';

export interface ICashRepository {
  optimisticLockCashUpdate(
    args: { user: User },
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult>;

  findByUserIdWithPessimisticLock(
    args: { userId: number },
    transactionalEntityManager: EntityManager,
  ): Promise<Cash>;

  save(args: Cash, transactionalEntityManager?: EntityManager): Promise<Cash>;

  getTransactionManager(): EntityManager;
}
