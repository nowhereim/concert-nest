import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/user/models/user';
import { Repository } from 'src/infrastructure/base/base-repository';
import { UserEntity } from 'src/infrastructure/user/entities/user.entity';
import { EntityManager, EntityTarget } from 'typeorm';
import { UserMapper } from 'src/infrastructure/user/mapper/user.mapper';
/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class UserRepositoryForConcurrencyControlTest extends Repository<UserEntity> {
  protected entityClass: EntityTarget<UserEntity> = UserEntity;

  async register(
    args: User,
    transactionalEntityManager?: EntityManager,
  ): Promise<User> {
    const entity = UserMapper.toRegisterEntity(args);

    const excute = transactionalEntityManager
      ? await transactionalEntityManager.save(entity)
      : await this.getManager().save(this.entityClass, entity);

    return UserMapper.toDomain(excute);
  }
  async save(
    args: User,
    transactionalEntityManager?: EntityManager,
  ): Promise<User> {
    const entity = UserMapper.toEntity(args);
    const excute = transactionalEntityManager
      ? await transactionalEntityManager.save(entity)
      : await this.getManager().save(this.entityClass, entity);

    return UserMapper.toDomain(excute);
  }

  async findByUserId(args: { userId: number }): Promise<User> {
    const entity = await this.getManager().findOne(this.entityClass, {
      where: { id: args.userId },
      relations: ['cash'],
    });
    return UserMapper.toDomain(entity);
  }

  async findByUserIdWithPessimisticLock(
    args: {
      userId: number;
    },
    transactionalEntityManager,
  ): Promise<User> {
    const entity = await transactionalEntityManager.findOne(this.entityClass, {
      where: { id: args.userId },
      lock: { mode: 'pessimistic_write' },
      relations: ['cash'],
    });
    return UserMapper.toDomain(entity);
  }
}
