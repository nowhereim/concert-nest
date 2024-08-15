import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class ReservationClientImpl {
  async registerReservation(args: {
    userId: number;
    concertId: number;
    seatId: number;
  }): Promise<void> {
    try {
      const { data } = await axios.post(
        `${process.env.RESERVATION_SERVICE_URL}/reservation`,
        args,
      );
      return data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
