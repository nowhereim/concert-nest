import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure/base/base-repository';
import { EntityTarget, EntityManager } from 'typeorm';
import { EventType } from 'src/domain/events/event.dispatcher';
import { OutboxEntity } from './outbox.entity';
import { IConcertOutboxReader } from 'src/domain/events/interface/concert-outbox-reader.interface';
import { Outbox } from 'src/domain/events/outbox';

@Injectable()
export class OutboxReaderImpl
  extends Repository<OutboxEntity>
  implements IConcertOutboxReader
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
}
