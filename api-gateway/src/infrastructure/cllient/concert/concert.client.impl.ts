import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class ConcertClientImpl {
  async findAvailableDate(args: { concertId: number }) {
    try {
      const response = await axios.get(
        `${process.env.CONCERT_SERVICE_URL}/concert/available-dates/?concertId=${args.concertId}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
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
    try {
      const response = await axios.get(
        `${process.env.CONCERT_SERVICE_URL}/concert/available-seats/?concertScheduleId=${args.concertScheduleId}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
