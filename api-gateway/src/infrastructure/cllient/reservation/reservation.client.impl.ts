import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class ReservationClientImpl {
  async registerReservation(args: {
    userId: number;
    concertId: number;
    seatId: number;
  }): Promise<void> {
    const { data } = await axios.post(
      `${process.env.RESERVATION_SERVICE_URL}/reservation`,
      args,
      {
        timeout: 3000,
      },
    );
    return data;
  }

  async findByUserIdWithPending(args: { userId: number }): Promise<void> {
    const { data } = await axios.get(
      `${process.env.RESERVATION_SERVICE_URL}/reservation?userId=${args.userId}`,
      {
        timeout: 3000,
      },
    );
    return data;
  }
}
