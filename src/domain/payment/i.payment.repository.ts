import { EntityManager } from 'typeorm';
import { Payment } from './payment';

export interface IPaymentRepository {
  save(
    args: Payment,
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment>;
  findByPaymentId(
    args: { paymentId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment>;
}
