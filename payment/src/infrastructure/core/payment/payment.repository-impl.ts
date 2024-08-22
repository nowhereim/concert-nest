import { Injectable } from '@nestjs/common';
import { Repository } from '../../base/base-repository';
import { PaymentEntity } from './payment.entity';
import { IPaymentRepository } from 'src/domain/payment/interface/i.payment.repository';
import { Payment } from 'src/domain/payment/payment';
import { EntityManager, EntityTarget } from 'typeorm';
import { PaymentMapper } from './payment.mapper';

@Injectable()
export class PaymentRepositoryImpl
  extends Repository<PaymentEntity>
  implements IPaymentRepository
{
  protected entityClass: EntityTarget<PaymentEntity> = PaymentEntity;

  async save(
    args: Payment,
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment> {
    const entity = new PaymentEntity(args);
    return PaymentMapper.toDomain(
      transactionalEntityManager
        ? await transactionalEntityManager.save(entity)
        : await this.getManager().save(entity),
    );
  }

  async findByUserIdStatusPending(
    args: { userId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment> {
    const entity = await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder(this.entityClass, 'payment')
      .where('payment.userId = :userId', { userId: args.userId })
      .andWhere('payment.status = :status', { status: 'PENDING' })
      .getOne();
    return PaymentMapper.toDomain(entity);
  }

  async findById(
    args: { paymentId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<Payment> {
    const entity = await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder(this.entityClass, 'payment')
      .where('payment.id = :id', { id: args.paymentId })
      .getOne();
    return PaymentMapper.toDomain(entity);
  }
}
