import { Injectable } from '@nestjs/common';
import { IConcertRepository } from 'src/domain/concert/i.concert.repository';
import { Concert } from 'src/domain/concert/models/concert';
import { Repository } from '../base/base-repository';
import { ConcertEntity } from './entities/concert.entity';
import { EntityManager, EntityTarget } from 'typeorm';
import { ConcertMapper } from './concert.mapper';

@Injectable()
export class ConcertRepositoryImpl
  extends Repository<ConcertEntity>
  implements IConcertRepository
{
  protected entityClass: EntityTarget<ConcertEntity> = ConcertEntity;

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
}
