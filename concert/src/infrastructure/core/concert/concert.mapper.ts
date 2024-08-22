import { ConcertSchedule } from 'src/domain/concert/models/concert-schedule';
import { ConcertEntity } from './entities/concert.entity';
import { Seat } from 'src/domain/concert/models/seat';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertScheduleEntity } from './entities/concert-schedule.entity';
import { SeatEntity } from './entities/seat.entity';

export class ConcertMapper {
  static toDomain(entity: ConcertEntity) {
    if (!entity) return null;

    return new Concert({
      id: entity.id,
      name: entity.name,
      concertSchedules: entity.concertSchedules.map((schedule) => {
        return new ConcertSchedule({
          id: schedule.id,
          totalSeats: schedule.totalSeats,
          reservedSeats: schedule.reservedSeats,
          openAt: schedule.openAt,
          closeAt: schedule.closeAt,
          bookingStartAt: schedule.bookingStartAt,
          bookingEndAt: schedule.bookingEndAt,
          seats: schedule.seats.map((seat) => {
            return new Seat({
              id: seat.id,
              seatNumber: seat.seatNumber,
              isActive: seat.isActive,
              price: seat.price,
              version: seat.version,
            });
          }),
        });
      }),
    });
  }

  static toEntity(domain: Concert) {
    return new ConcertEntity({
      id: domain.id,
      name: domain.name,
      concertSchedules: domain.concertSchedules.map((schedule) => {
        return new ConcertScheduleEntity({
          id: schedule.id,
          concertId: domain.id,
          totalSeats: schedule.totalSeats,
          reservedSeats: schedule.reservedSeats,
          openAt: schedule.openAt,
          closeAt: schedule.closeAt,
          bookingStartAt: schedule.bookingStartAt,
          bookingEndAt: schedule.bookingEndAt,
          seats: schedule.seats.map((seat) => {
            return new SeatEntity({
              id: seat.id,
              concertScheduleId: schedule.id,
              seatNumber: seat.seatNumber,
              isActive: seat.isActive,
              price: seat.price,
            });
          }),
        });
      }),
    });
  }

  static toSeatEntity(domain: Concert, seatId?: number): any {
    const seatDomain = domain.concertSchedules
      .map((schedule) => schedule.seats)
      .flat()
      .find((seat) => Number(seat.id) === seatId);
    return new SeatEntity({
      id: seatDomain.id,
      isActive: seatDomain.isActive,
      seatNumber: seatDomain.seatNumber,
      price: seatDomain.price,
      version: seatDomain.version,
    });
  }
}
