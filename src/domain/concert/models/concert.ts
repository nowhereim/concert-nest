import { ConcertSchedule } from './concert-schedule';
import { Seat } from './seat';
import { notFound } from 'src/domain/exception/exceptions';

export class Concert {
  id: number;
  name: string;
  concertSchedules: ConcertSchedule[] = [];
  constructor(args: {
    id?: number;
    name: string;
    concertSchedules?: ConcertSchedule[];
  }) {
    Object.assign(this, args);
  }

  findAvailableDate(): void {
    this.concertSchedules = this.concertSchedules.filter(
      (schedule) =>
        schedule.totalSeats > schedule.reservedSeats &&
        new Date() > schedule.openAt &&
        new Date() < schedule.closeAt &&
        new Date() > schedule.bookingStartAt &&
        new Date() < schedule.bookingEndAt,
    );

    if (this.concertSchedules.length === 0) {
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertId: ${this.id} not found`,
      });
    }
  }

  findAvailableSeat(args: { concertScheduleId: number }): void {
    this.findAvailableDate();
    const concertSchedule = this.concertSchedules.find(
      (schedule) => Number(schedule.id) === args.concertScheduleId,
    );

    if (!concertSchedule) {
      throw notFound('예약 가능한 좌석이 없습니다.', {
        cause: `concertScheduleId: ${args.concertScheduleId} not found`,
      });
    }
    concertSchedule.findAvailableSeat();
  }

  getConcertInfoBySeatId(args: { seatId: number }): ConcertInfo {
    const concertSchedule = this.concertSchedules.find((schedule) =>
      schedule.seats.find((seat) => Number(seat.id) === args.seatId),
    );
    if (!concertSchedule) {
      throw notFound('예약 가능한 좌석이 없습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    }

    const seat = concertSchedule.seats.find(
      (seat) => Number(seat.id) === args.seatId,
    );

    return {
      id: this.id,
      name: this.name,
      concertSchedule: concertSchedule,
      seat: seat,
    };
  }

  seatActivate(args: { seatId: number }): void {
    const concertSchedule = this.concertSchedules.find((schedule) =>
      schedule.seats.find((seat) => Number(seat.id) === args.seatId),
    );
    if (!concertSchedule) {
      throw notFound('해당 좌석이 존재하지 않습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    }
    concertSchedule.seatActivate({ seatId: args.seatId });
  }

  seatDeactivate(args: { seatId: number }): void {
    const concertSchedule = this.concertSchedules.find((schedule) =>
      schedule.seats.find((seat) => Number(seat.id) === args.seatId),
    );
    if (!concertSchedule) {
      throw notFound('해당 좌석이 존재하지 않습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    }
    concertSchedule.seatDeactivate({ seatId: args.seatId });
  }
}

export class ConcertInfo {
  id: number;
  name: string;
  concertSchedule: ConcertSchedule;
  seat: Seat;
}
