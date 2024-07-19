import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { QueueFacadeApp } from 'src/application/queue/queue.facade(app)';
import { notFound } from 'src/domain/exception/exceptions';

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

    const queue = await this.queueFacadeApp.validQueue({
      queueId: Number(queueId),
      needActive: this.needActive(),
    });

    request.userInfo = {
      userId: queue.userId,
      queueId: queue.id,
      queueStatus: queue.status,
    };

    return true;
  }

  protected abstract needActive(): boolean;

  private extractQueueIdFromHeader(request: any): string | null {
    const authHeader = request.headers['queue-token'];
    return authHeader;
  }
}
