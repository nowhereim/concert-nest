import { PaymentStatus } from 'src/domain/payment/payment';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../base/base-entity';

@Entity()
export class PaymentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  seatNumber: number;

  @Column()
  concertName: string;

  @Column()
  openAt: Date;

  @Column()
  closeAt: Date;

  @Column({ nullable: true, default: null })
  totalAmount: number;

  @Column()
  status: PaymentStatus;

  constructor(args: {
    id?: number;
    userId: number;
    seatNumber: number;
    concertName: string;
    openAt: Date;
    closeAt: Date;
    totalAmount?: number;
    status: PaymentStatus;
  }) {
    super();
    Object.assign(this, args);
  }
}
