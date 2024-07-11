import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Seat } from './seat';

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
      throw new NotFoundException('예약 가능한 좌석이 없습니다.');
  }

  reserveSeat(): void {
    if (this.reservedSeats === this.totalSeats)
      throw new NotFoundException('예약 가능한 좌석이 없습니다.');
    this.reservedSeats += 1;
  }

  cancelSeat(): void {
    if (this.reservedSeats === 0)
      throw new BadRequestException('취소 가능한 좌석이 없습니다.');
    this.reservedSeats -= 1;
  }

  seatActivate(args: { seatId: number }): void {
    const seat = this.seats.find((el) => Number(el.id) === args.seatId);
    if (!seat) throw new NotFoundException('좌석이 존재하지 않습니다.');
    seat.activate();
    this.reservedSeats--;
  }

  seatDeactivate(args: { seatId: number }): void {
    const seat = this.seats.find((el) => Number(el.id) === args.seatId);
    if (!seat) throw new NotFoundException('좌석이 존재하지 않습니다.');
    seat.deactivate();
    this.reservedSeats++;
  }
}
