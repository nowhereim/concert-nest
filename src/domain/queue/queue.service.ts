import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue, QueueStatusEnum } from './queue';
import { IQueueRepository } from './i.queue.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class QueueService {
  constructor(
    @Inject('IQueueRepository')
    private readonly queueRepository: IQueueRepository,
  ) {}

  async createQueue(args: { userId: number }): Promise<Queue> {
    const concert = await this.queueRepository.findByUserId({
      userId: args.userId,
    });
    if (concert) throw new BadRequestException('Queue already exists');
    const queue = new Queue({
      userId: args.userId,
      status: QueueStatusEnum.WAITING,
    });

    return await this.queueRepository.save(queue);
  }

  async findByQueueId(args: { queueId: number }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId(args);
    if (!queue) throw new NotFoundException('Queue not found');
    return queue;
  }

  async inProgress(args: { queueId: number }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId({
      queueId: args.queueId,
    });
    if (!queue) throw new NotFoundException('Queue not found');

    queue.inProgress();

    return await this.queueRepository.save(queue);
  }

  async complete(args: { queueId: number }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId({
      queueId: args.queueId,
    });
    if (!queue) throw new NotFoundException('Queue not found');

    queue.complete();

    return await this.queueRepository.save(queue);
  }

  async expire(
    args: { userId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<Queue> {
    const queue = await this.queueRepository.findByUserId({
      userId: args.userId,
    });
    if (!queue) throw new NotFoundException('Queue not found');

    queue.expire();

    return await this.queueRepository.save(queue, transactionalEntityManager);
  }

  async clearExpiredActiveRecords(): Promise<Queue[]> {
    const queues = await this.queueRepository.findExpiredActiveRecords();
    queues.forEach((queue) => queue.expire());
    return await this.queueRepository.saveAll(queues);
  }

  async activateWaitingRecords(): Promise<Queue[]> {
    const activeCount = await this.queueRepository.findActiveRecordsCount();
    const maxActiveCount = 10;

    if (activeCount < maxActiveCount) {
      const limit = maxActiveCount - activeCount;
      const waitingRecords = await this.queueRepository.findWaitingRecords({
        limit,
      });

      waitingRecords.forEach((queue) => queue.inProgress());

      return await this.queueRepository.saveAll(waitingRecords);
    }
  }
}
