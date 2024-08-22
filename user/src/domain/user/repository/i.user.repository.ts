import { EntityManager } from 'typeorm';
import { User } from 'src/domain/user/models/user';

export interface IUserRepository {
  save(args: User, transactionalEntityManager?: EntityManager): Promise<User>;
  findByUserId(
    args: { userId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<User>;
  getTransactionManager(): EntityManager;
}
