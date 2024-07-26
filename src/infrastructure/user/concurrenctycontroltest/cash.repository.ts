import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/user/models/user';
import { Repository } from 'src/infrastructure/base/base-repository';
import { EntityTarget, UpdateResult } from 'typeorm';
import { UserMapper } from 'src/infrastructure/user/mapper/user.mapper';
import { CashEntity } from '../entities/cash.entity';
/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class CashRepositoryForConcurrencyControlTest extends Repository<CashEntity> {
  save(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findByUserId(): Promise<User> {
    throw new Error('Method not implemented.');
  }
  register(): Promise<User> {
    throw new Error('Method not implemented.');
  }
  protected entityClass: EntityTarget<CashEntity> = CashEntity;

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
}
