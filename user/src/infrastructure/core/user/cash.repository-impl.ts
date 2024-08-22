import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/user/models/user';
import { Repository } from 'src/infrastructure/base/base-repository';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { UserMapper } from 'src/infrastructure/core/user/mapper/user.mapper';
import { CashEntity } from 'src/infrastructure/core/user/entities/cash.entity';
import { ICashRepository } from 'src/domain/user/repository/i.cash.repository';
import { Cash } from 'src/domain/user/models/cash';

@Injectable()
export class CashRepositoryImpl
  extends Repository<CashEntity>
  implements ICashRepository
{
  protected entityClass: EntityTarget<CashEntity> = CashEntity;

  async save(
    args: Cash,
    transactionalEntityManager: EntityManager,
  ): Promise<any> {
    const entity = new CashEntity({
      id: args.id,
      userId: args.userId,
      balance: args.balance,
      version: args.version,
    });
    const excute = await transactionalEntityManager.save(entity);
    return new Cash({
      id: excute.id,
      balance: excute.balance,
      version: excute.version,
    });
  }

  async optimisticLockCashUpdate(args: { user: User }): Promise<UpdateResult> {
    const userEntity = UserMapper.toEntity(args.user);
    const cashEntity = userEntity.cash;
    const result = await this.getManager()
      .createQueryBuilder()
      .update(CashEntity)
      .set({
        balance: cashEntity.balance,
      })
      .where('id = :id', { id: cashEntity.id })
      .andWhere('version = :version', { version: cashEntity.version })
      .execute();

    return result;
  }

  async findByUserIdWithPessimisticLock(
    args: { userId: number },
    transactionalEntityManager: EntityManager,
  ): Promise<Cash> {
    const entity = await transactionalEntityManager.findOne(this.entityClass, {
      where: { user: { id: args.userId } },
      lock: { mode: 'pessimistic_write' },
    });

    return new Cash({
      id: entity.id,
      userId: args.userId,
      balance: entity.balance,
      version: entity.version,
    });
  }
}
