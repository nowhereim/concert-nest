import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { Repository } from '../base/base-repository';
import { SeatEntity } from './entities/seat.entity';
import { ISeatRepository } from 'src/domain/concert/i.seat.repository';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertMapper } from './concert.mapper';

@Injectable()
export class SeatRepositoryImpl
  extends Repository<SeatEntity>
  implements ISeatRepository
{
  protected entityClass: EntityTarget<SeatEntity> = SeatEntity;
  save(args: any, transactionalEntityManager?: EntityManager): Promise<any> {
    return;
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
}
