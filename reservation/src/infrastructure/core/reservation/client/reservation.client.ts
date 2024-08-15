import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class ReservationClient {
  async getConcertInfo(args: { concertId: number; seatId: number }) {
    try {
      const response = await axios.get(
        `http://localhost:8085/concert/concert-info/?concertId=${args.concertId}&seatId=${args.seatId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
