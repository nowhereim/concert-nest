import { Inject, Injectable } from '@nestjs/common';
import { Queue, QueueStatusEnum } from './queue';
import { IQueueRepository } from './i.queue.repository';
import { EntityManager } from 'typeorm';
import { badRequest, unauthorized } from 'src/domain/exception/exceptions';
import { notFound } from '../exception/exceptions';

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
    if (concert)
      throw badRequest('이미 대기열에 등록되어 있습니다.', {
        cause: `userId: ${args.userId} already in queue`,
      });
    const queue = new Queue({
      userId: args.userId,
      status: QueueStatusEnum.WAITING,
    });

    return await this.queueRepository.save(queue);
  }

  async findByQueueId(args: { queueId: number }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId(args);
    if (!queue)
      throw notFound('대기열을 찾을 수 없습니다.', {
        cause: `queueId: ${args.queueId} not found`,
      });

    const waitingAhead = await this.queueRepository.findByQueueIdWaitingAhead({
      queueId: args.queueId,
    });
    if (waitingAhead) queue.setSequenceNumber(waitingAhead);
    return queue;
  }

  async inProgress(args: { queueId: number }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId({
      queueId: args.queueId,
    });
    if (!queue)
      throw notFound('대기열을 찾을 수 없습니다.', {
        cause: `queueId: ${args.queueId} not found`,
      });

    queue.inProgress();

    return await this.queueRepository.save(queue);
  }

  async complete(args: { queueId: number }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId({
      queueId: args.queueId,
    });
    if (!queue)
      throw notFound('대기열을 찾을 수 없습니다.', {
        cause: `queueId: ${args.queueId} not found`,
      });

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
    if (!queue)
      throw notFound('대기열을 찾을 수 없습니다.', {
        cause: `userId: ${args.userId} not found`,
      });

    queue.expire();

    return await this.queueRepository.save(queue, transactionalEntityManager);
  }

  async validQueue(args: {
    queueId: number;
    needActive: boolean;
  }): Promise<Queue> {
    const queue = await this.queueRepository.findByQueueId(args);
    if (!queue) {
      throw unauthorized('인증되지 않은 사용자입니다.', {
        cause: `QueueId: ${args.queueId} not found`,
      });
    }

    queue.verify(args.needActive);
    return queue;
  }

  async clearExpiredActiveRecords(): Promise<Queue[]> {
    const queues = await this.queueRepository.findExpiredActiveRecords();
    queues.forEach((queue) => queue.expire());
    return await this.queueRepository.saveAll(queues);
  }

  async activateWaitingRecords(): Promise<Queue[]> {
    const activeCount = await this.queueRepository.findActiveRecordsCount();
    const maxActiveCount = 10; // 요구조건이 최대 50이라 그냥 다 밀어넣어도 상관없지만, 10으로 설정 ( 창구식 )

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
