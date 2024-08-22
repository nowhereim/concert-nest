import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class PaymentClientImpl {
  async pay(args: { userId: number; seatId: number }): Promise<void> {
    try {
      const { data } = await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/payment`,
        args,
      );
      return data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
