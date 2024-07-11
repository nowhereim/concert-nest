import { ForbiddenException } from '@nestjs/common';

export class SeatReservation {
  id: number;
  seatId: number;
  userId: number;
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

  verify(args: { userId: number; seatId: number }) {
    if (
      this.status === SeatReservationStatus.PENDING &&
      this.userId === args.userId
    ) {
      throw new ForbiddenException('이미 좌석을 예약한 사용자 입니다.');
    }

    if (
      this.seatId === args.seatId &&
      (this.status === SeatReservationStatus.PENDING ||
        this.status === SeatReservationStatus.COMPLETE)
    ) {
      throw new ForbiddenException('이미 예약된 좌석입니다.');
    }
  }
}

export enum SeatReservationStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
  EXPIRED = 'EXPIRED',
}
//
