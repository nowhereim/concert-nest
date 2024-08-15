import { Inject, Injectable } from '@nestjs/common';
import { IReservationClient } from './reservation.client.interface';

@Injectable()
export class ReservationFacadeApp {
  constructor(
    @Inject('IReservationClient')
    private readonly reservationClient: IReservationClient,
  ) {}
  async registerReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
  }) {
    return await this.reservationClient.registerReservation(args);
  }
}
