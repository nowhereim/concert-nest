import { Injectable } from '@nestjs/common';
import { IReservationRepository } from 'src/domain/reservation/i.reservation.repository';
import {
  SeatReservation,
  SeatReservationStatus,
} from 'src/domain/reservation/seat.reservation';
import { Repository } from '../base/base-repository';
import { ReservationEntity } from './reservation.entity';
import { EntityManager, EntityTarget } from 'typeorm';
import { ReservationMapper } from './reservation.mapper';

@Injectable()
export class ReservationRepositoryImpl
  extends Repository<ReservationEntity>
  implements IReservationRepository
{
  protected entityClass: EntityTarget<ReservationEntity> = ReservationEntity;

  async save(
    args: SeatReservation,
    transactionalEntityManager?: EntityManager,
  ): Promise<SeatReservation> {
    const entity = new ReservationEntity({
      id: args.id,
      userId: args.userId,
      seatId: args.seatId,
      status: args.status,
      price: args.price,
      concertName: args.concertName,
      seatNumber: args.seatNumber,
      openAt: args.openAt,
      closeAt: args.closeAt,
    });
    const excute = transactionalEntityManager
      ? await transactionalEntityManager.save(entity)
      : await this.getManager().save(entity);
    return ReservationMapper.toDomain(excute);
  }

  async findBySeatId(args: { seatId: number }): Promise<SeatReservation> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.seatId = :seatId', {
        seatId: args.seatId,
      })
      .getOne();

    return ReservationMapper.toDomain(entity);
  }

  async findExpired(): Promise<SeatReservation[]> {
    const entities = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.status = :status', {
        status: 'PENDING',
      })
      .andWhere('reservation.createdAt < :expiredAt', {
        expiredAt: new Date(new Date().getTime() - 1000 * 60 * 5),
      })
      .getMany();

    return entities.map((entity) => ReservationMapper.toDomain(entity));
  }

  async saveAll(
    args: SeatReservation[],
    transactionalEntityManager: EntityManager,
  ): Promise<SeatReservation[]> {
    const entities = transactionalEntityManager
      ? await transactionalEntityManager.save(this.entityClass, args)
      : await this.getManager().save(this.entityClass, args);
    return entities.map((entity) => ReservationMapper.toDomain(entity));
  }

  async findAllByUserIdOrSeatId(args: {
    userId: number;
    seatId: number;
  }): Promise<SeatReservation[]> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.userId = :userId', {
        userId: args.userId,
      })
      .orWhere('reservation.seatId = :seatId', {
        seatId: args.seatId,
      })
      .getMany();

    return entity.map((el) => ReservationMapper.toDomain(el));
  }

  async findByUserId(args: { userId: number }): Promise<SeatReservation> {
    const entities = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.userId = :userId', {
        userId: args.userId,
      })
      .andWhere('reservation.status = :status', {
        status: SeatReservationStatus.PENDING,
      })
      .getOne();

    return ReservationMapper.toDomain(entities);
  }
}
