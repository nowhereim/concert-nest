import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ValidTokenUseCase } from 'src/application/queue/usecase/valid-token.use-case';
import { forbidden, notFound } from 'src/domain/exception/exceptions';
import { QueueStatusEnum } from 'src/domain/queue/models/queue';

@Injectable()
export abstract class BaseQueueAuthGuard implements CanActivate {
  protected validTokenUseCase: ValidTokenUseCase;

  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.validTokenUseCase) {
      this.validTokenUseCase = this.moduleRef.get(ValidTokenUseCase, {
        strict: false,
      });
    }

    const request = context.switchToHttp().getRequest();
    const queueId = this.extractQueueIdFromHeader(request);

    if (!queueId) {
      throw notFound('인증되지 않은 사용자입니다.', {
        cause: 'Queue token not found',
      });
    }

    const queue = await this.validTokenUseCase.execute({ queueId: queueId });
    if (this.needActive() && queue.status === QueueStatusEnum.WAITING)
      throw forbidden('대기열에 활성화 되지 않은 사용자입니다.', {
        cause: `Queue status is Not IN_PROGRESS ${queue}`,
      });

    return true;
  }

  protected abstract needActive(): boolean;

  private extractQueueIdFromHeader(request: any): number | null {
    const authHeader = request.headers['queue-token'];
    return authHeader;
  }
}
