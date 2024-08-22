import { Injectable } from '@nestjs/common';
import { IReservationRepository } from 'src/domain/reservation/interface/i.reservation.repository';
import {
  SeatReservation,
  SeatReservationStatus,
} from 'src/domain/reservation/seat.reservation';
import { Repository } from '../../base/base-repository';
import { ReservationEntity } from './entities/reservation.entity';
import { EntityManager, EntityTarget } from 'typeorm';
import { ReservationMapper } from './reservation.mapper';
@Injectable()
export class ReservationRepositoryImpl
  extends Repository<ReservationEntity>
  implements IReservationRepository
{
  constructor(entityManager: EntityManager) {
    super(entityManager);
  }

  protected entityClass: EntityTarget<ReservationEntity> = ReservationEntity;

  async save(
    args: SeatReservation,
    transactionalEntityManager?: EntityManager,
  ): Promise<SeatReservation> {
    const entity = new ReservationEntity({
      ...args,
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

  async findExpired(cutoffTime: Date): Promise<SeatReservation[]> {
    const entities = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.status = :status', {
        status: 'PENDING',
      })
      .andWhere('reservation.createdAt < :expiredAt', {
        expiredAt: cutoffTime,
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

  async findByUserIdWithPending(args: {
    userId: number;
  }): Promise<SeatReservation> {
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

  async findById(args: { id: number }): Promise<SeatReservation> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.id = :id', {
        id: args.id,
      })
      .getOne();

    return ReservationMapper.toDomain(entity);
  }

  async findByUserIdAndStatusPending(args: {
    userId: number;
  }): Promise<SeatReservation> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'reservation')
      .where('reservation.userId = :userId', {
        userId: args.userId,
      })
      .andWhere('reservation.status = :status', {
        status: SeatReservationStatus.PENDING,
      })
      .getOne();

    return ReservationMapper.toDomain(entity);
  }
}
