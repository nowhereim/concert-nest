import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class PaymentClientImpl {
  async pay(args: { userId: number; seatId: number }): Promise<void> {
    const { data } = await axios.post(
      `${process.env.PAYMENT_SERVICE_URL}/payment`,
      args,
      {
        timeout: 3000,
      },
    );
    return data;
  }
}
