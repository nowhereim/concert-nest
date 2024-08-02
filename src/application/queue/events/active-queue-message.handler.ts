import { Injectable } from '@nestjs/common';
import { internalServerError } from 'src/domain/exception/exceptions';
import { KafkaBaseConsumerActiveQueue } from 'src/infrastructure/kafka/base/kafka.base.redis.consumer';
import { RegisterActiveTokenUseCase } from 'src/application/queue/usecase-v2/register-active-token.use-case';
import { ResetLastOffsetUseCase } from '../usecase-v2/reset-last-offset.use-case';

@Injectable()
export class ActiveQueueMessageHandler extends KafkaBaseConsumerActiveQueue {
  constructor(
    private readonly registerActiveTokenUseCase: RegisterActiveTokenUseCase,
    private readonly resetLastOffsetUseCase: ResetLastOffsetUseCase,
  ) {
    super('key', 'test');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.registerActiveTokenUseCase.execute({ userId: message });
    } catch (e) {
      throw internalServerError('kafka message handler Error', {
        cause: e,
      });
    }
  }

  async resetLastOffset(offset: string): Promise<void> {
    await this.resetLastOffsetUseCase.execute(offset);
  }
}
