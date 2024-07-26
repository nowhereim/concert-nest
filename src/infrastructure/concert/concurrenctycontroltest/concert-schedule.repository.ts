import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { Repository } from 'src/infrastructure/base/base-repository';
import { ConcertScheduleEntity } from '../entities/concert-schedule.entity';
import { ConcertSchedule } from 'src/domain/concert/models/concert-schedule';

/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class ConcertScheduleRepositoryForConcurrencyControlTest extends Repository<ConcertScheduleEntity> {
  protected entityClass: EntityTarget<ConcertScheduleEntity> =
    ConcertScheduleEntity;
  save(args: any, transactionalEntityManager?: EntityManager): Promise<any> {
    console.log(args, transactionalEntityManager);
    return;
  }

  async updateReservedSeatsWithOptimisticLock(
    args: { concertSchedule: ConcertSchedule },
    transactionalEntityManager?: any,
  ): Promise<UpdateResult> {
    return await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder()
      .update(ConcertScheduleEntity)
      .set({
        reservedSeats: args.concertSchedule.reservedSeats,
      })
      .where('id = :id', { id: args.concertSchedule.id })
      .andWhere('version = :version', {
        version: args.concertSchedule.version,
      })
      .execute();
  }

  async updateReservedSeatsWithPessimisticLock(
    args: { concertSchedule: ConcertSchedule },
    transactionalEntityManager?: any,
  ): Promise<UpdateResult> {
    return await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder()
      .update(ConcertScheduleEntity)
      .set({
        reservedSeats: args.concertSchedule.reservedSeats,
      })
      .where('id = :id', { id: args.concertSchedule.id })
      .execute();
  }

  async updateReservedSeats(
    args: { concertSchedule: ConcertSchedule },
    transactionalEntityManager?: any,
  ): Promise<UpdateResult> {
    return await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder()
      .update(ConcertScheduleEntity)
      .set({
        reservedSeats: args.concertSchedule.reservedSeats,
      })
      .where('id = :id', { id: args.concertSchedule.id })
      .execute();
  }
}
