import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { QueueStatusEnum } from 'src/domain/queue/queue';
import { QueueEntity } from 'src/infrastructure/queue/queue.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class QueueAuthGuard implements CanActivate {
  constructor(private entityManager: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const queueId = this.extractQueueIdFromHeader(request);

    if (!queueId) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const queue = await this.entityManager.findOne(QueueEntity, {
        where: { id: Number(queueId) },
      });

      if (!queue) {
        throw new UnauthorizedException('인증되지 않은 사용자입니다.');
      }

      if (queue.status === QueueStatusEnum.EXPIRED)
        throw new UnauthorizedException('만료된 토큰입니다.');

      request.userInfo = {
        userId: queue.userId,
        queueId: queue.id,
        queueStatus: queue.status,
      };

      return true;
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  private extractQueueIdFromHeader(request: any): string | null {
    const authHeader = request.headers['queue-token'];
    return authHeader;
  }
}
