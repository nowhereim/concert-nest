import { Queue } from 'src/domain/queue/queue';
import { QueueEntity } from './queue.entity';

export class QueueMapper {
  static toDomain(entity: QueueEntity) {
    if (!entity) return null;
    return new Queue({
      id: entity.id,
      userId: entity.userId,
      status: entity.status,
      createdAt: entity.createdAt,
      expiredAt: entity.expiredAt,
    });
  }
}
