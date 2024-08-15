import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../base/base-entity';
import { CashHistoryType } from 'src/domain/user/models/cash-history';

@Entity()
export class CashHistoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  amount: number;

  @Column()
  type: CashHistoryType;

  constructor(args: {
    id?: number;
    userId: number;
    amount: number;
    type: CashHistoryType;
  }) {
    super();
    Object.assign(this, args);
  }
}
