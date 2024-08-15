import { Payment } from 'src/domain/payment/payment';
import { PaymentEntity } from './payment.entity';

export class PaymentMapper {
  static toEntity(domain: Payment) {
    return new PaymentEntity({
      id: domain.id,
      userId: domain.userId,
      seatNumber: domain.seatNumber,
      concertName: domain.concertName,
      openAt: domain.openAt,
      closeAt: domain.closeAt,
      totalAmount: domain.totalAmount,
      status: domain.status,
    });
  }

  static toDomain(entity: PaymentEntity) {
    if (!entity) return null;
    return new Payment({
      id: entity.id,
      userId: entity.userId,
      seatNumber: entity.seatNumber,
      concertName: entity.concertName,
      openAt: entity.openAt,
      closeAt: entity.closeAt,
      totalAmount: entity.totalAmount,
      status: entity.status,
    });
  }
}
