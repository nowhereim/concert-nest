import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure/base/base-repository';
import {
  OutboxEntity,
  OutboxStatus,
} from 'src/infrastructure/event/outbox/concert/outbox.entity';
import { EntityTarget, EntityManager } from 'typeorm';
import { EventType } from 'src/domain/events/event.dispatcher';
import { IConcertOutboxWriter } from 'src/domain/events/interface/concert-outbox-writer.interface';

@Injectable()
export class OutboxWriterImpl
  extends Repository<OutboxEntity>
  implements IConcertOutboxWriter
{
  protected entityClass: EntityTarget<OutboxEntity>;

  async save(
    args: {
      event: any;
      transactionId: string;
      eventType: EventType;
    },
    transactionalEntityManager?: EntityManager,
  ): Promise<void> {
    const entity = new OutboxEntity({
      event: args.event,
      transactionId: args.transactionId,
      eventType: args.eventType,
    });
    await (transactionalEntityManager ?? this.getManager()).save(
      OutboxEntity,
      entity,
    );
  }

  async updateSuccess(
    args: { transactionId: string; eventType: EventType },
    transactionalEntityManager?: EntityManager,
  ): Promise<void> {
    await (transactionalEntityManager ?? this.getManager())
      .createQueryBuilder(OutboxEntity, 'outbox')
      .update(OutboxEntity)
      .set({ status: OutboxStatus.SUCCESS })
      .where('transactionId = :transactionId', {
        transactionId: args.transactionId,
      })
      .andWhere('eventType = :eventType', { eventType: args.eventType })
      .execute();
  }
}
