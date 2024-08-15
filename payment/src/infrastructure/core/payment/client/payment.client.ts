import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class PaymentClient {
  async getReservationInfo(args: { userId: number }) {
    try {
      const { data } = await axios.get(
        `http://localhost:8082/reservation/?userId=${args.userId}`,
      );
      return data;
    } catch (error) {
      throw error;
    }
  }
}
