import { Inject } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { EventType } from '../event.dispatcher';
import { IUserOutboxWriter } from 'src/domain/events/interface/user-outbox-writer.interface';
import { IEventPublisher } from 'src/domain/events/interface/event-publisher.interface';
import { UserEvent } from '../user.event';

export class BaseEventDispatcher {
  constructor(
    @Inject('IUserOutboxWriter')
    private readonly userOutboxWriter: IUserOutboxWriter,
    @Inject('IEventPublisher')
    private readonly eventPublisher: IEventPublisher,
  ) {}
  protected createEventArgs(args: any): UserEvent {
    const transactionUUID = nanoid();
    return new UserEvent({
      aggregateId: args?.targetAfter?.id,
      op: args.operation,
      before: args?.targetBefore,
      after: args?.targetAfter,
      args: args?.args,
      transactionId: args.transactionId ?? transactionUUID,
    });
  }

  protected async saveOutbox(
    event: UserEvent,
    eventType: EventType,
    transactionalEntityManager?: any,
  ) {
    await this.userOutboxWriter.save(
      { event, transactionId: event.transactionId, eventType },
      transactionalEntityManager,
    );
  }

  protected publishEvent(event: UserEvent, eventType: EventType) {
    this.eventPublisher.publishEvent({ event, type: eventType });
  }
}
