import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from '../base/base-repository';
import { IQueueRepository } from 'src/domain/queue/i.queue.repository';
import { QueueEntity } from './queue.entity';
import { Queue, QueueStatusEnum } from 'src/domain/queue/queue';
import { EntityManager, EntityTarget } from 'typeorm';
import { QueueMapper } from './queue.mapper';

@Injectable()
export class QueueRepositoryImpl
  extends Repository<QueueEntity>
  implements IQueueRepository
{
  protected entityClass: EntityTarget<QueueEntity> = QueueEntity;

  async save(
    args: Queue,
    transactionalEntityManager?: EntityManager,
  ): Promise<Queue> {
    const entity = new QueueEntity(args);
    const excute = transactionalEntityManager
      ? await transactionalEntityManager.save(entity)
      : await this.getManager().save(entity);
    return QueueMapper.toDomain(excute);
  }

  async findByQueueId(args: { queueId: number }): Promise<Queue> {
    const entity = await this.getManager().findOne(this.entityClass, {
      where: { id: args.queueId },
    });
    if (!entity) throw new NotFoundException('Queue not found');
    return QueueMapper.toDomain(entity);
  }

  async findByUserId(args: { userId: number }): Promise<Queue> {
    const entity = await this.getManager().findOne(this.entityClass, {
      where: { userId: args.userId },
    });
    return QueueMapper.toDomain(entity);
  }

  async findByQueueIdAndUserId(args: {
    queueId: number;
    userId: number;
  }): Promise<Queue> {
    const entity = await this.getManager().findOne(this.entityClass, {
      where: { id: args.queueId, userId: args.userId },
    });
    return QueueMapper.toDomain(entity);
  }

  async findExpiredActiveRecords(): Promise<Queue[]> {
    const entities = await this.getManager()
      .createQueryBuilder(this.entityClass, 'queue')
      .where('queue.status = :status', { status: QueueStatusEnum.IN_PROGRESS })
      .andWhere('queue.expiredAt < NOW()')
      .getMany();
    return entities.map((entity) => QueueMapper.toDomain(entity));
  }
  async findActiveRecordsCount(): Promise<number> {
    return await this.getManager().count(this.entityClass, {
      where: { status: QueueStatusEnum.IN_PROGRESS },
    });
  }
  async findWaitingRecords(args: { limit: number }): Promise<Queue[]> {
    const entities = await this.getManager().find(this.entityClass, {
      where: { status: QueueStatusEnum.WAITING },
      take: args.limit,
    });
    return entities.map((entity) => QueueMapper.toDomain(entity));
  }
  async saveAll(args: Queue[]): Promise<Queue[]> {
    const entities = await this.getManager().save(this.entityClass, args);
    return entities.map((entity) => QueueMapper.toDomain(entity));
  }
}
