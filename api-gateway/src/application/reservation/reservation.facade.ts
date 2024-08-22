import { HttpException, Inject, Injectable } from '@nestjs/common';
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
    try {
      return await this.reservationClient.registerReservation(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }

  async findByUserIdWithPending(args: { userId: number }) {
    try {
      return await this.reservationClient.findByUserIdWithPending(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
