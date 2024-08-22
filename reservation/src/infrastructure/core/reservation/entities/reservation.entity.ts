import { SeatReservationStatus } from 'src/domain/reservation/seat.reservation';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/base/base-entity';

@Entity()
@Index('idx_user_id', ['userId'])
@Index('idx_concert_id', ['concertId'])
@Index('idx_seat_id', ['seatId'])
export class ReservationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() //조회용
  userId: number;

  @Column() //조회용
  concertId: number;

  @Column() //조회용
  seatId: number;

  @Column()
  status: SeatReservationStatus;

  @Column()
  price: number;

  @Column()
  concertName: string;

  @Column()
  seatNumber: number;

  @Column()
  openAt: Date;

  @Column()
  closeAt: Date;

  constructor(args: {
    id?: number;
    userId: number;
    concertId: number;
    seatId: number;
    status: SeatReservationStatus;
    price: number;
    concertName: string;
    seatNumber: number;
    openAt: Date;
    closeAt: Date;
    deletedAt?: Date;
    createdAt?: Date;
  }) {
    super();
    Object.assign(this, args);
  }
}
