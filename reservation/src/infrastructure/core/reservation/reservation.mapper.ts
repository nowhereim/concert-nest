import { SeatReservation } from 'src/domain/reservation/seat.reservation';
import { ReservationEntity } from './entities/reservation.entity';

export class ReservationMapper {
  static toDomain(entity: ReservationEntity): SeatReservation {
    if (!entity) return null;
    return new SeatReservation({
      id: entity.id,
      userId: entity.userId,
      seatId: entity.seatId,
      status: entity.status,
      price: entity.price,
      concertId: entity.concertId,
      concertName: entity.concertName,
      seatNumber: entity.seatNumber,
      openAt: entity.openAt,
      closeAt: entity.closeAt,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    });
  }
}
