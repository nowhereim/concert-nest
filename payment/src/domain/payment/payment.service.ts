import { Inject, Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from './payment';
import { IPaymentRepository } from './interface/i.payment.repository';
import { internalServerError, notFound } from '../exception/exceptions';
import { EventType } from 'src/domain/events/event.dispatcher';
import { EventDispatcher } from '../events/event.dispatcher';
import { IPaymentOutboxReader } from '../events/interface/payment-outbox-reader.interface';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IPaymentOutboxReader')
    private readonly paymentOutboxReader: IPaymentOutboxReader,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async pay(args: {
    userId: number;
    seatNumber: number;
    concertName: string;
    openAt: Date;
    closeAt: Date;
    totalAmount: number;
    transactionId?: string;
  }): Promise<Payment> {
    const payment = new Payment({
      status: PaymentStatus.PENDING,
      ...args,
    });
    const savedPayment = await this.paymentRepository
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const savedPayment = await this.paymentRepository.save(
          payment,
          transactionalEntityManager,
        );
        await this.eventDispatcher.payEvent({
          targetAfter: savedPayment,
          args,
          transactionalEntityManager,
          transactionId: args.transactionId,
        });
        return savedPayment;
      });
    return savedPayment;
  }

  async completePayment(args: {
    userId: number;
    transactionId: string;
  }): Promise<Payment> {
    try {
      const payment =
        await this.paymentRepository.findByUserIdStatusPending(args);
      if (!payment)
        throw notFound('결제를 찾을 수 없습니다.', {
          cause: `paymentId: ${args.userId} not found`,
        });
      payment.complete();

      return await this.paymentRepository
        .getTransactionManager()
        .transaction(async (transactionalEntityManager) => {
          const savedPaymet = await this.paymentRepository.save(
            payment,
            transactionalEntityManager,
          );
          await this.eventDispatcher.completePaymentEvent({
            args,
            transactionId: args.transactionId,
            transactionalEntityManager,
          });
          return savedPaymet;
        });
    } catch (e) {
      const outbox = await this.paymentOutboxReader.findByTransactionId({
        transactionId: args.transactionId,
        eventType: EventType.PAYMENT,
      });

      await this.eventDispatcher.completeFailPaymentEvent({
        targetAfter: outbox.event.after,
        targetBefor: outbox.event.before,
        args: args,
        transactionId: args.transactionId,
      });

      throw internalServerError('결제를 완료할 수 없습니다.', {
        cause: e,
      });
    }
  }

  async failPayment(args: { transactionId: string }): Promise<Payment> {
    try {
      const outbox = await this.paymentOutboxReader.findByTransactionId({
        transactionId: args.transactionId,
        eventType: EventType.PAYMENT,
      });
      if (!outbox)
        throw notFound('결제를 찾을 수 없습니다.', {
          cause: `transactionId: ${args.transactionId} not found`,
        });
      const payment = await this.paymentRepository.findById({
        paymentId: outbox.event.aggregateId,
      });
      payment.fail();
      return await this.paymentRepository.save(payment);
    } catch (e) {
      throw internalServerError('결제를 실패처리할 수 없습니다.', {
        cause: e,
      });
    }
  }

  async findById(args: { paymentId: number }) {
    return await this.paymentRepository.findById(args);
  }
}
