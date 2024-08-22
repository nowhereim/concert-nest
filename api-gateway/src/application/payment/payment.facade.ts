import { HttpException, Inject, Injectable } from '@nestjs/common';
import { IPaymentClient } from './payment.client.interface';

@Injectable()
export class PaymentFacadeApp {
  constructor(
    @Inject('IPaymentClient')
    private readonly paymentClient: IPaymentClient,
  ) {}
  async pay(args: { userId: number; seatId: number }) {
    try {
      return await this.paymentClient.pay(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
