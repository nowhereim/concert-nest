import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from '../../base/base-entity';

@Entity()
export class CashEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  balance: number;

  @OneToOne(() => UserEntity, (user) => user.cash)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  constructor(args: { id?: number; userId?: number; balance: number }) {
    super();
    Object.assign(this, args);
  }
}
