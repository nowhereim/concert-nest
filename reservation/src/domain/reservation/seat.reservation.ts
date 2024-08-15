import { forbidden } from 'src/domain/exception/exceptions';

export class SeatReservation {
  id: number;
  seatId: number;
  userId: number;
  concertId: number;
  seatNumber: number;
  price: number;
  concertName: string;
  openAt: Date;
  closeAt: Date;
  status: SeatReservationStatus;
  createdAt: Date;
  deletedAt: Date;

  constructor(args: {
    id?: number;
    seatId: number;
    userId: number;
    concertId: number;
    status: SeatReservationStatus;
    seatNumber: number;
    price: number;
    concertName: string;
    openAt: Date;
    closeAt: Date;
    createdAt?: Date;
    deletedAt?: Date;
  }) {
    Object.assign(this, args);
  }

  complete(): void {
    this.status = SeatReservationStatus.COMPLETE;
  }

  expire(): void {
    this.status = SeatReservationStatus.EXPIRED;
    this.deletedAt = new Date();
  }

  fail(): void {
    this.status = SeatReservationStatus.FAIL;
    this.deletedAt = new Date();
  }

  verify(args: { userId: number; seatId: number }) {
    if (
      this.status === SeatReservationStatus.PENDING &&
      this.userId === args.userId
    ) {
      throw forbidden('예약 불가능한 사용자 입니다.', {
        cause: `userId: ${args.userId} already reserved user`,
      });
    }

    if (
      this.seatId === args.seatId &&
      (this.status === SeatReservationStatus.PENDING ||
        this.status === SeatReservationStatus.COMPLETE)
    ) {
      throw forbidden('이미 예약된 좌석입니다.', {
        cause: `seatId: ${args.seatId} already reserved seat`,
      });
    }
  }
}

export enum SeatReservationStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
  EXPIRED = 'EXPIRED',
  FAIL = 'FAIL',
}
//
