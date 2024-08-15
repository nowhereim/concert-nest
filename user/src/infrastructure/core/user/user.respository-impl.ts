import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/user/models/user';
import { IUserRepository } from 'src/domain/user/repository/i.user.repository';
import { Repository } from '../../base/base-repository';
import { UserEntity } from './entities/user.entity';
import { EntityManager, EntityTarget } from 'typeorm';
import { UserMapper } from './mapper/user.mapper';

@Injectable()
export class UserRepositoryImpl
  extends Repository<UserEntity>
  implements IUserRepository
{
  protected entityClass: EntityTarget<UserEntity> = UserEntity;

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
    const entity = await this.getManager()
      .createQueryBuilder(UserEntity, 'user')
      .where('user.id = :userId', { userId: args.userId })
      .leftJoinAndSelect('user.cash', 'cash')
      .getOne();

    return UserMapper.toDomain(entity);
  }
}
