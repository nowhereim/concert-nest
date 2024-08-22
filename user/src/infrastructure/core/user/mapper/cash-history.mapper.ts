import { CashHistory } from 'src/domain/user/models/cash-history';
import { CashHistoryEntity } from '../entities/cash-history.entity';

export class CashHistoryMapper {
  static toDomain(entity: CashHistoryEntity): CashHistory {
    if (!entity) return null;
    return new CashHistory({
      id: entity.id,
      userId: entity.userId,
      amount: entity.amount,
      type: entity.type,
    });
  }

  static toEntity(domain: CashHistory): CashHistoryEntity {
    if (!domain) return null;
    return new CashHistoryEntity({
      id: domain.id,
      userId: domain.userId,
      amount: domain.amount,
      type: domain.type,
    });
  }

  static toSave(domain: CashHistory): CashHistoryEntity {
    if (!domain) return null;
    return new CashHistoryEntity({
      userId: domain.userId,
      amount: domain.amount,
      type: domain.type,
    });
  }
}
