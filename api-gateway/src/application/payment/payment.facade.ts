import { Inject, Injectable } from '@nestjs/common';
import { IPaymentClient } from './payment.client.interface';

@Injectable()
export class PaymentFacadeApp {
  constructor(
    @Inject('IPaymentClient')
    private readonly paymentClient: IPaymentClient,
  ) {}
  async pay(args: { userId: number; seatId: number }) {
    return await this.paymentClient.pay(args);
  }
}
