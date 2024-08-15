import { Injectable } from '@nestjs/common';
import { Repository } from '../../base/base-repository';
import { CashHistoryEntity } from './entities/cash-history.entity';
import { ICashHistoryRepository } from 'src/domain/user/repository/i.cash-history.repository';
import { CashHistory } from 'src/domain/user/models/cash-history';
import { EntityTarget } from 'typeorm';
import { CashHistoryMapper } from './mapper/cash-history.mapper';

@Injectable()
export class CashHistoryRepositoryImpl
  extends Repository<CashHistoryEntity>
  implements ICashHistoryRepository
{
  protected entityClass: EntityTarget<CashHistoryEntity> = CashHistoryEntity;
  async save(args: CashHistory): Promise<CashHistory> {
    return CashHistoryMapper.toDomain(
      await this.getManager().save(
        this.entityClass,
        new CashHistoryEntity({
          userId: args.userId,
          amount: args.amount,
          type: args.type,
        }),
      ),
    );
  }
}
