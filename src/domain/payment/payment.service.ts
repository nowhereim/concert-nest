import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Payment, PaymentStatus } from './payment';
import { IPaymentRepository } from './i.payment.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async pay(
    args: {
      userId: number;
      seatNumber: number;
      concertName: string;
      openAt: Date;
      closeAt: Date;
      totalAmount: number;
    },
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment> {
    const payment = new Payment({
      status: PaymentStatus.PENDING,
      ...args,
    });

    return await this.paymentRepository.save(
      payment,
      transactionalEntityManager,
    );
  }

  async completePayment(
    args: { paymentId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findByPaymentId(
      args,
      transactionalEntityManager,
    );
    if (!payment) throw new NotFoundException('결제를 찾을 수 없습니다.');
    payment.complete();
    return await this.paymentRepository.save(
      payment,
      transactionalEntityManager,
    );
  }

  async failPayment(args: { paymentId: number }): Promise<Payment> {
    const payment = await this.paymentRepository.findByPaymentId(args);
    if (!payment) throw new NotFoundException('결제를 찾을 수 없습니다.');
    payment.fail();
    return await this.paymentRepository.save(payment);
  }
}
