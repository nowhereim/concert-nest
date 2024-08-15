import { Injectable } from '@nestjs/common';
import { IConcertRepository } from 'src/domain/concert/interface/i.concert.repository';
import { Concert } from 'src/domain/concert/models/concert';
import { Repository } from '../../base/base-repository';
import { ConcertEntity } from './entities/concert.entity';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { ConcertMapper } from './concert.mapper';
import { SeatRepositoryImpl } from './seat.repository-impl';
import { Seat } from 'src/domain/concert/models/seat';
import { ConcertSchedule } from 'src/domain/concert/models/concert-schedule';
import { ConcertScheduleRepositoryImpl } from './concert-schedule.repository';
// import { KafkaConcertProducerImpl } from 'src/infrastructure/kafka/kafka-concert.producer';

@Injectable()
export class ConcertRepositoryImpl
  extends Repository<ConcertEntity>
  implements IConcertRepository
{
  protected entityClass: EntityTarget<ConcertEntity> = ConcertEntity;
  constructor(
    entityManager: EntityManager,
    private readonly seatRepositoryImpl: SeatRepositoryImpl,
    private readonly concertScheduleRepositoryImpl: ConcertScheduleRepositoryImpl,
  ) {
    super(entityManager);
  }
  async saveSeat(
    args: { seat: Seat },
    transactionalEntityManager?: EntityManager,
  ): Promise<Seat> {
    return await this.seatRepositoryImpl.save(args, transactionalEntityManager);
  }

  async save(
    args: Concert,
    transactionalEntityManager: EntityManager,
  ): Promise<Concert> {
    const entity = ConcertMapper.toEntity(args);
    return ConcertMapper.toDomain(
      transactionalEntityManager
        ? await transactionalEntityManager.save(entity)
        : await this.getManager().save(entity),
    );
  }

  async findByConcertId(args: { concertId: number }): Promise<Concert> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'concert')
      .where('concert.id = :concertId', { concertId: args.concertId })
      .leftJoinAndSelect('concert.concertSchedules', 'concertSchedules')
      .leftJoinAndSelect('concertSchedules.seats', 'seats')
      .getOne();

    return ConcertMapper.toDomain(entity);
  }

  async findByConcertScheduleId(args: {
    concertScheduleId: number;
  }): Promise<Concert> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'concert')
      .leftJoinAndSelect('concert.concertSchedules', 'concertSchedules')
      .leftJoinAndSelect('concertSchedules.seats', 'seats')
      .where('concertSchedules.id = :concertScheduleId', {
        concertScheduleId: args.concertScheduleId,
      })
      .getOne();

    return ConcertMapper.toDomain(entity);
  }

  async findBySeatId(args: { seatId: number }): Promise<Concert> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'concert')
      .leftJoinAndSelect('concert.concertSchedules', 'concertSchedules')
      .leftJoinAndSelect('concertSchedules.seats', 'seats')
      .where('seats.id = :seatId', { seatId: args.seatId })
      .getOne();

    return ConcertMapper.toDomain(entity);
  }

  async findBySeatIdFromSeat(args: { seatId: number }): Promise<Seat> {
    const entity = await this.seatRepositoryImpl.findBySeatId(args);
    return new Seat({
      id: entity.id,
      seatNumber: entity.seatNumber,
      isActive: entity.isActive,
      price: entity.price,
      version: entity.version,
    });
  }

  async findBySeatIdAndConcertId(args: {
    seatId: number;
    concertId: number;
  }): Promise<Concert> {
    const entity = await this.getManager()
      .createQueryBuilder(this.entityClass, 'concert')
      .leftJoinAndSelect('concert.concertSchedules', 'concertSchedules')
      .leftJoinAndSelect('concertSchedules.seats', 'seats')
      .where('concert.id = :concertId', { concertId: args.concertId })
      .andWhere('seats.id = :seatId', { seatId: args.seatId })
      .getOne();

    return ConcertMapper.toDomain(entity);
  }

  async updateIsActiveWithOptimisticLock(
    args: { concert: Concert; seatId: number },
    transactionalEntityManager?: any,
  ): Promise<UpdateResult> {
    return await this.seatRepositoryImpl.updateIsActiveWithOptimisticLock(
      args,
      transactionalEntityManager,
    );
  }

  async updateReservedSeats(
    args: { concertSchedule: ConcertSchedule },
    transactionalEntityManager: EntityManager,
  ): Promise<UpdateResult> {
    return await this.concertScheduleRepositoryImpl.updateReservedSeats(
      args,
      transactionalEntityManager,
    );
  }
}
