import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure/base/base-repository';
import { OutboxEntity } from 'src/infrastructure/event/outbox/payment/outbox.entity';
import { EntityTarget, EntityManager } from 'typeorm';
import { EventType } from 'src/domain/events/event.dispatcher';
import { Outbox } from 'src/domain/events/outbox';
import { IPaymentOutboxReader } from 'src/domain/events/interface/payment-outbox-reader.interface';

@Injectable()
export class OutboxReaderImpl
  extends Repository<OutboxEntity>
  implements IPaymentOutboxReader
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
