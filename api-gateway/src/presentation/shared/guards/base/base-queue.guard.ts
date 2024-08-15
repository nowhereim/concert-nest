import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';
import { forbidden, notFound } from 'src/presentation/exception/exceptions';

enum QueueStatusEnum {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
}

@Injectable()
export abstract class BaseQueueAuthGuard implements CanActivate {
  protected queueFacadeApp: QueueFacadeApp;
  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.queueFacadeApp) {
      this.queueFacadeApp = this.moduleRef.get(QueueFacadeApp, {
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

    const queue = await this.queueFacadeApp.validToken({ queueId: queueId });
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
