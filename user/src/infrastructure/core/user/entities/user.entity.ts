import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CashEntity } from './cash.entity';
import { BaseEntity } from '../../../base/base-entity';

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => CashEntity, (cash) => cash.user, {
    cascade: ['insert', 'update'],
  })
  cash: CashEntity;

  constructor(args: { id?: number; name: string; cash: CashEntity }) {
    super();
    Object.assign(this, args);
  }
}
