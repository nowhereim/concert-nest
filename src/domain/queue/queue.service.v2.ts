import { Inject, Injectable } from '@nestjs/common';
import { QueueStatusEnum } from './models/queue';
import { QueueV2 } from './models/queue-v2';
import { nanoid } from 'nanoid';
import { IQueueRepositoryV2 } from './repositories/i.queue.repository.v2';

@Injectable()
export class QueueServiceV2 {
  constructor(
    @Inject('IQueueRepositoryV2')
    private readonly queueRepository: IQueueRepositoryV2,
  ) {}

  async registerActiveToken(args: { userId: string }): Promise<any> {
    const ttl = 5 * 60;
    await this.queueRepository.setActive(args.userId, ttl);
    return {
      id: args.userId,
      status: QueueStatusEnum.WAITING,
    };
  }

  async resetLastOffset(args: { offset: string }): Promise<void> {
    await this.queueRepository.resetLastOffset(args.offset);
  }

  async validToken(args: {
    queueId: string;
    waitingPosition: string;
  }): Promise<QueueV2> {
    const queue = new QueueV2({
      id: args.queueId,
      waitingPosition: args.waitingPosition,
    });
    const getActiveToken =
      await this.queueRepository.findByQueueIdExistActiveToken(queue.id);
    if (!getActiveToken) {
      queue.calculateWaitingPositionAndTime({
        lastOffset: Number(await this.queueRepository.getLastOffset()),
      });
      return queue;
    }
    queue.setInProgress();
    return queue;
  }

  async expireToken(args: { queueId: string }): Promise<void> {
    await this.queueRepository.clearActiveQueue(args.queueId);
  }

  async registerQueue(): Promise<QueueV2> {
    const uuid = nanoid();
    const [messageMetaData] =
      await this.queueRepository.sendMessageToActiveToken(uuid);
    return new QueueV2({
      id: uuid,
      waitingPosition: messageMetaData.baseOffset,
    });
  }
}
