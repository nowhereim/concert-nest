import { Injectable } from '@nestjs/common';
import { Queue } from 'src/domain/queue/queue';
import { QueueService } from 'src/domain/queue/queue.service';

@Injectable()
export class QueueFacadeApp {
  constructor(private readonly queueService: QueueService) {}

  async createQueue(args: { userId: number }): Promise<Queue> {
    return await this.queueService.createQueue(args);
  }

  async findByQueueId(args: { queueId: number }): Promise<Queue> {
    return await this.queueService.findByQueueId(args);
  }

  //  활성상태이면서 만료시간이 도달한 대기열을 찾아 활성상태를 만료상태로 변경
  async expireQueue(): Promise<Queue[]> {
    return await this.queueService.clearExpiredActiveRecords();
  }

  //  활성상태 인원을 체크 한 후 비어있는 수 만큼 대기열을 활성상태로 변경
  async activeQueue(): Promise<Queue[]> {
    return await this.queueService.activateWaitingRecords();
  }
}
