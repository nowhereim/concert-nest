import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '../../../base/base-entity';
import { ConcertScheduleEntity } from './concert-schedule.entity';

@Entity()
export class SeatEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(
    () => ConcertScheduleEntity,
    (concertSchedule) => concertSchedule.seats,
  )
  @JoinColumn({ name: 'concertScheduleId' })
  concertSchedule: ConcertScheduleEntity;

  @Column()
  isActive: boolean;

  @Column()
  seatNumber: number;

  @Column()
  price: number;

  @VersionColumn()
  version: number;

  constructor(args: {
    id?: number;
    concertScheduleId?: number;
    isActive: boolean;
    seatNumber: number;
    price: number;
    version?: number;
  }) {
    super();
    Object.assign(this, args);
  }
}
