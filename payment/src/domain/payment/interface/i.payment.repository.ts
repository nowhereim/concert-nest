import { EntityManager } from 'typeorm';
import { Payment } from 'src/domain/payment/payment';

export interface IPaymentRepository {
  save(
    args: Payment,
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment>;
  findByUserIdStatusPending(
    args: { userId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment>;

  getTransactionManager(): EntityManager;

  findById(args: { paymentId: number }): Promise<Payment>;
}
