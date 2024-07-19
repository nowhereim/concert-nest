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

  constructor(args: {
    id?: number;
    totalSeats: number;
    reservedSeats?: number;
    openAt: Date;
    closeAt: Date;
    bookingStartAt: Date;
    bookingEndAt: Date;
    seats?: Seat[];
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

  // reserveSeat(): void {
  //   if (this.reservedSeats === this.totalSeats)
  //     throw notFound('예약 가능한 좌석이 없습니다.', {
  //       cause: `concertScheduleId: ${this.id} not found`,
  //     });
  //   const totalSeatsValid = this.reservedSeats + 1 <= this.totalSeats;
  //   if (totalSeatsValid) this.reservedSeats += 1;
  // }

  // cancelSeat(): void {
  //   if (this.reservedSeats === 0)
  //     throw badRequest('예약된 좌석이 없습니다.', {
  //       cause: `concertScheduleId: ${this.id} not found`,
  //     });
  //   this.reservedSeats -= 1;
  // }

  seatActivate(args: { seatId: number }): void {
    const seat = this.seats.find((el) => Number(el.id) === args.seatId);
    if (!seat)
      notFound('좌석이 존재하지 않습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    seat.activate();
    if (this.reservedSeats > 0) this.reservedSeats -= 1;
  }

  seatDeactivate(args: { seatId: number }): void {
    const seat = this.seats.find((el) => Number(el.id) === args.seatId);
    if (!seat)
      throw notFound('좌석이 존재하지 않습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    seat.deactivate();
    const totalSeatsValid = this.reservedSeats + 1 <= this.totalSeats;
    if (totalSeatsValid) this.reservedSeats++;
  }
}
