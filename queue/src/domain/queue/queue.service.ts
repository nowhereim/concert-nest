import { Inject, Injectable } from '@nestjs/common';
import { Queue, QueueStatusEnum } from './models/queue';
import { badRequest } from 'src/domain/exception/exceptions';
import { notFound } from '../exception/exceptions';
import { IQueueRepository } from './repositories/queue.repository.interface';

@Injectable()
export class QueueService {
  constructor(
    @Inject('IQueueRepository')
    private readonly queueRepository: IQueueRepository,
  ) {}

  async registerQueue(args: { userId: number }): Promise<Queue> {
    const queue = await this.queueRepository.registerWaitingQueue(args.userId);
    if (!queue) {
      throw badRequest('이미 대기열에 등록되어 있습니다.', {
        cause: `userId: ${args.userId} already in queue`,
      });
    }
    return queue;
  }

  async expireToken(args: { userId: number }): Promise<void> {
    await this.queueRepository.clearActiveToken(args.userId);
  }

  async validToken(args: { queueId: number }): Promise<Queue> {
    const getWatingPosition =
      await this.queueRepository.findByUserIdWatingPosition(args.queueId);
    if (getWatingPosition === null) {
      const checkActiveQueue =
        await this.queueRepository.findByUserIdExistActiveToken(args.queueId);
      if (!checkActiveQueue) {
        throw notFound('대기열을 찾을 수 없습니다.', {
          cause: `queueId: ${args.queueId} not found`,
        });
      } else {
        return new Queue({
          id: args.queueId,
          status: QueueStatusEnum.IN_PROGRESS,
        });
      }
    }

    return new Queue({
      id: args.queueId,
      waitingPosition: getWatingPosition,
      status: QueueStatusEnum.WAITING,
    });
  }

  async activateWaitingRecords(): Promise<void> {
    const limit = 9999;
    const expire = 5 * 60;
    await this.queueRepository.moveToActiveToken(limit, expire);
  }
}
