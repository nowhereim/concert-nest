import { Seat } from './seat';
import { notFound } from 'src/domain/exception/exceptions';

export class ConcertSchedule {
  id: number;
  totalSeats: number;
  reservedSeats: number;
  openAt: Date;
  closeAt: Date;
  bookingStartAt: Date;
  bookingEndAt: Date;
  seats: Seat[] = [];
  version: number;

  constructor(args: {
    id?: number;
    totalSeats: number;
    reservedSeats?: number;
    openAt: Date;
    closeAt: Date;
    bookingStartAt: Date;
    bookingEndAt: Date;
    seats?: Seat[];
    version?: number;
  }) {
    Object.assign(this, args);
  }

  findAvailableSeat(): void {
    this.seats = this.seats.filter((el) => el.isActive);
    if (this.seats.length === 0)
      throw notFound('예약 가능한 좌석이 없습니다.', {
        cause: `concertScheduleId: ${this.id} not found`,
      });
  }

  seatActivate(args: { seatId: number }): Seat {
    const seat = this.seats.find((el) => Number(el.id) === args.seatId);
    if (!seat)
      notFound('좌석이 존재하지 않습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    seat.activate();
    if (this.reservedSeats > 0) this.reservedSeats -= 1;
    return seat;
  }

  seatDeactivate(args: { seatId: number }): void {
    const seat = this.seats.find((el) => Number(el.id) === args.seatId);
    if (!seat)
      throw notFound('좌석이 존재하지 않습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    const totalSeatsValid = this.reservedSeats + 1 <= this.totalSeats;
    if (totalSeatsValid) this.reservedSeats++;
    seat.deactivate();
  }
}
