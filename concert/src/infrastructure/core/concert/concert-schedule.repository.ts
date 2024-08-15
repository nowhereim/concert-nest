import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { Repository } from '../../base/base-repository';
import { ConcertScheduleEntity } from './entities/concert-schedule.entity';
import { ConcertSchedule } from 'src/domain/concert/models/concert-schedule';

@Injectable()
export class ConcertScheduleRepositoryImpl extends Repository<ConcertScheduleEntity> {
  save(args: any, transactionalEntityManager?: EntityManager): Promise<any> {
    throw new Error('Method not implemented.');
  }
  protected entityClass: EntityTarget<ConcertScheduleEntity> =
    ConcertScheduleEntity;
  async updateReservedSeats(
    args: { concertSchedule: ConcertSchedule },
    transactionalEntityManager: EntityManager,
  ): Promise<UpdateResult> {
    return await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder(this.entityClass, 'concertSchedule')
      .update(ConcertScheduleEntity)
      .set({ reservedSeats: args.concertSchedule.reservedSeats })
      .where('id = :id', { id: args.concertSchedule.id })
      .execute();
  }
}
