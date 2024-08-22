import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure/base/base-repository';
import { OutboxEntity } from 'src/infrastructure/event/outbox/reservation/outbox.entity';
import { EntityTarget, EntityManager } from 'typeorm';
import { EventType } from 'src/domain/events/event.dispatcher';
import { Outbox } from 'src/domain/events/outbox';
import { IReservationOutboxReader } from 'src/domain/events/interface/reservation-outbox-writer.interface';

@Injectable()
export class OutboxReaderImpl
  extends Repository<OutboxEntity>
  implements IReservationOutboxReader
{
  protected entityClass: EntityTarget<OutboxEntity>;

  async findByTransactionId(
    args: { transactionId: string; eventType: EventType },
    transactionalEntityManager?: EntityManager,
  ): Promise<Outbox> {
    return new Outbox(
      await (transactionalEntityManager ?? this.getManager()).findOne(
        OutboxEntity,
        {
          where: {
            transactionId: args.transactionId,
            eventType: args.eventType,
          },
        },
      ),
    );
  }

  async findPendingEvents(): Promise<Outbox[]> {
    return (
      await this.getManager()
        .createQueryBuilder(OutboxEntity, 'outbox')
        .where('status = :status', { status: 'PENDING' })
        .andWhere('createdAt < :createdAt', {
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
        })
        .getMany()
    ).map((entity) => new Outbox(entity));
  }
}
