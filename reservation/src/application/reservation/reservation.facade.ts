import { Injectable } from '@nestjs/common';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { ReservationClient } from 'src/infrastructure/core/reservation/client/reservation.client';

@Injectable()
export class ReservationFacadeApp {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly reservationClient: ReservationClient,
  ) {}

  async registerReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
  }) {
    const concert = await this.reservationClient.getConcertInfo({
      concertId: args.concertId,
      seatId: args.seatId,
    });

    const reservation = await this.reservationService.registerReservation({
      ...args,
      seatNumber: concert.seat.seatNumber,
      concertName: concert.name,
      concertId: concert.id,
      price: concert.seat.price,
      openAt: concert.concertSchedule.openAt,
      closeAt: concert.concertSchedule.closeAt,
    });
    return reservation;
  }

  async findByUserIdWithPending(args: { userId: number }) {
    return await this.reservationService.findByUserIdWithPending(args);
  }

  async findById(args: { id: number }) {
    return await this.reservationService.findById(args);
  }

  async completeReservation(args: { userId: number; transactionId: string }) {
    return await this.reservationService.completeReservation(args);
  }

  async failReservation(args: { transactionId: string }) {
    return await this.reservationService.failReservation(args);
  }

  async expireAllExpiredReservations(): Promise<void> {
    await this.reservationService.expireAllExpiredReservations();
  }
}
