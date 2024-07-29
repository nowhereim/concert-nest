import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget, UpdateResult } from 'typeorm';
import { Repository } from 'src/infrastructure/base/base-repository';
import { SeatEntity } from 'src/infrastructure/concert/entities/seat.entity';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertMapper } from 'src/infrastructure/concert/concert.mapper';

/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class SeatRepositoryForConcurrencyControlTest extends Repository<SeatEntity> {
  protected entityClass: EntityTarget<SeatEntity> = SeatEntity;
  save(args: any, transactionalEntityManager?: EntityManager): Promise<any> {
    console.log(args, transactionalEntityManager);
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

  async updateIsActiveWithPessimisticLock(
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
      .setLock('pessimistic_write')
      .execute();
  }

  async updateIsActive(
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
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  async findBySeatId(args: { seatId: number }): Promise<SeatEntity> {
    return await this.getManager()
      .createQueryBuilder(this.entityClass, 'seat')
      .where('seat.id = :seatId', { seatId: args.seatId })
      .getOne();
  }
}
