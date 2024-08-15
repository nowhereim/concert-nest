import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/base/base-entity';
export enum OutboxStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

@Entity()
export class OutboxEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  event: string;

  @Column({
    type: 'text',
  })
  transactionId: string;

  @Column()
  eventType: string;

  @Column()
  status: OutboxStatus = OutboxStatus.PENDING;

  constructor(args: {
    id?: number;
    event: any;
    status?: OutboxStatus;
    transactionId: string;
    eventType: string;
    createdAt?: Date;
  }) {
    super();
    if (args) {
      Object.assign(this, args);

      this.event = JSON.stringify(args.event);
    }
  }
}
