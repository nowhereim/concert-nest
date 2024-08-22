import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class ConcertClientImpl {
  async findAvailableDate(args: { concertId: number }) {
    const response = await axios.get(
      `${process.env.CONCERT_SERVICE_URL}/concert/available-dates/?concertId=${args.concertId}`,
      {
        timeout: 3000,
      },
    );
    return response.data;
  }

  async findAvailableSeats(args: { concertScheduleId: number }): Promise<
    {
      concertId: number;
      concertName: string;
      concertDate: string;
      concertPrice: number;
      concertSeat: number;
    }[]
  > {
    const response = await axios.get(
      `${process.env.CONCERT_SERVICE_URL}/concert/available-seats/?concertScheduleId=${args.concertScheduleId}`,
      {
        timeout: 3000,
      },
    );
    return response.data;
  }
}
