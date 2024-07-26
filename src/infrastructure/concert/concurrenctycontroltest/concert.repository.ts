import { Injectable } from '@nestjs/common';
import { Concert } from 'src/domain/concert/models/concert';
import { Repository } from 'src/infrastructure/base/base-repository';
import { ConcertEntity } from 'src/infrastructure/concert/entities/concert.entity';
import { EntityManager, EntityTarget } from 'typeorm';
import { ConcertMapper } from 'src/infrastructure/concert/concert.mapper';

/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class ConcertRepositoryForConcurrencyControlTest extends Repository<ConcertEntity> {
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

  async findByConcertIdWithPessimisticLock(
    args: {
      concertId: number;
    },
    transactionalEntityManager: EntityManager,
  ): Promise<Concert> {
    const entity = await (
      transactionalEntityManager
        ? transactionalEntityManager
        : this.getManager()
    )
      .createQueryBuilder(this.entityClass, 'concert')
      .setLock('pessimistic_write')
      .where('concert.id = :concertId', { concertId: args.concertId })
      .leftJoinAndSelect('concert.concertSchedules', 'concertSchedules')
      .leftJoinAndSelect('concertSchedules.seats', 'seats')
      .getOne();

    return ConcertMapper.toDomain(entity);
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
}
