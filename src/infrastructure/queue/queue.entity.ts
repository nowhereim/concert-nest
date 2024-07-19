import { QueueStatusEnum } from 'src/domain/queue/queue';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base/base-entity';

@Entity()
export class QueueEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  status: QueueStatusEnum;

  @Column({ nullable: true })
  expiredAt: Date;

  constructor(args: {
    id?: number;
    userId: number;
    status: QueueStatusEnum;
    createdAt?: Date;
    expiredAt?: Date;
    deletedAt?: Date;
  }) {
    super();
    Object.assign(this, args);
  }
}
