import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '../../../base/base-entity';
import { ConcertEntity } from './concert.entity';
import { SeatEntity } from './seat.entity';

@Entity()
export class ConcertScheduleEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => ConcertEntity, (concert) => concert.concertSchedules)
  @JoinColumn({ name: 'concertId' })
  concert: ConcertEntity;

  @OneToMany(() => SeatEntity, (seat) => seat.concertSchedule, {
    cascade: ['insert', 'update'],
  })
  seats: SeatEntity[];

  @Column()
  totalSeats: number;

  @Column({ default: 0 })
  reservedSeats: number;

  @Column()
  openAt: Date;

  @Column()
  closeAt: Date;

  @Column()
  bookingStartAt: Date;

  @Column()
  bookingEndAt: Date;

  @VersionColumn()
  version: number;

  constructor(args: {
    id?: number;
    concertId?: number;
    totalSeats: number;
    reservedSeats?: number;
    openAt: Date;
    closeAt: Date;
    bookingStartAt: Date;
    bookingEndAt: Date;
    seats?: SeatEntity[];
    version?: number;
  }) {
    super();
    Object.assign(this, args);
  }
}
