import { Injectable } from '@nestjs/common';
import { Payment } from 'src/domain/payment/payment';
import { PaymentService } from 'src/domain/payment/payment.service';
import { PaymentClient } from 'src/infrastructure/core/payment/client/payment.client';

@Injectable()
export class PaymentFacadeApp {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentClient: PaymentClient,
  ) {}

  async pay(args: { userId: number; seatId: number }): Promise<Payment> {
    const reservation = await this.paymentClient.getReservationInfo({
      userId: args.userId,
    });
    /* 결제 생성 */
    const payment = await this.paymentService.pay({
      userId: args.userId,
      openAt: reservation.openAt,
      closeAt: reservation.closeAt,
      seatNumber: reservation.seatNumber,
      concertName: reservation.concertName,
      totalAmount: reservation.price,
    });

    return payment;
  }

  async findById(args: { paymentId: number }) {
    return await this.paymentService.findById(args);
  }

  async completePayment(args: { userId: number; transactionId: string }) {
    await this.paymentService.completePayment(args);
  }

  async failPayment(args: { transactionId: string }) {
    await this.paymentService.failPayment(args);
  }
}
