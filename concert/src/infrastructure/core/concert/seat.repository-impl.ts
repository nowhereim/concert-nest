import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { Repository } from '../../base/base-repository';
import { SeatEntity } from './entities/seat.entity';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertMapper } from './concert.mapper';
import { Seat } from 'src/domain/concert/models/seat';

@Injectable()
export class SeatRepositoryImpl extends Repository<SeatEntity> {
  protected entityClass: EntityTarget<SeatEntity> = SeatEntity;
  async save(
    args: { seat: Seat },
    transactionalEntityManager?: EntityManager,
  ): Promise<Seat> {
    const entity = await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    ).save(SeatEntity, new SeatEntity(args.seat));

    return new Seat(entity);
  }

  async updateIsActiveWithOptimisticLock(
    args: { concert: Concert; seatId: number },
    transactionalEntityManager?: any,
  ): Promise<UpdateResult> {
    const entity = ConcertMapper.toSeatEntity(args.concert, args.seatId);
    return await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder()
      .update(SeatEntity)
      .set({
        isActive: entity.isActive,
      })
      .where('id = :id', { id: entity.id })
      .andWhere('version = :version', {
        version: entity.version,
      })
      .execute();
  }

  async findBySeatId(args: { seatId: number }): Promise<SeatEntity> {
    return await this.getManager()
      .createQueryBuilder(this.entityClass, 'seat')
      .where('seat.id = :seatId', { seatId: args.seatId })
      .getOne();
  }
}
