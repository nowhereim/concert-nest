import { User } from 'src/domain/user/models/user';
import { UserEntity } from '../entities/user.entity';
import { Cash } from 'src/domain/user/models/cash';
import { CashEntity } from '../entities/cash.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    if (!entity) return null;
    return new User({
      id: entity.id,
      name: entity.name,
      cash: new Cash({
        id: entity.cash.id,
        userId: entity.id,
        balance: entity.cash.balance,
        version: entity.cash.version,
      }),
    });
  }

  static toEntity(domain: User): UserEntity {
    return new UserEntity({
      id: domain.id,
      name: domain.name,
      cash: new CashEntity({
        id: domain.cash.getId(),
        balance: domain.cash.getBalance(),
        version: domain.cash.getVersion(),
      }),
    });
  }

  static toRegisterEntity(domain: User): UserEntity {
    return new UserEntity({
      name: domain.name,
      cash: new CashEntity({
        balance: 0,
      }),
    });
  }
}
