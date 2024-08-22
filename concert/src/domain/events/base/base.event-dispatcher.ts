import { Inject } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { EventType } from 'src/domain/events/event.dispatcher';
import { IEventPublisher } from '../interface/event-publisher.interface';
import { ConcertEvent } from '../concert.event';
import { IConcertOutboxWriter } from '../interface/concert-outbox-writer.interface';

export class BaseEventDispatcher {
  constructor(
    @Inject('IConcertOutboxWriter')
    private readonly concertOutboxWriter: IConcertOutboxWriter,
    @Inject('IEventPublisher')
    private readonly eventPublisher: IEventPublisher,
  ) {}
  protected createEventArgs(args: any): ConcertEvent {
    const transactionUUID = nanoid();
    return new ConcertEvent({
      aggregateId: args?.targetAfter?.id,
      op: args.operation,
      before: args?.targetBefore,
      after: args?.targetAfter,
      args: args?.args,
      transactionId: args.transactionId ?? transactionUUID,
    });
  }

  protected async saveOutbox(
    event: ConcertEvent,
    eventType: EventType,
    transactionalEntityManager?: any,
  ) {
    await this.concertOutboxWriter.save(
      { event, transactionId: event.transactionId, eventType },
      transactionalEntityManager,
    );
  }

  protected publishEvent(event: ConcertEvent, eventType: EventType) {
    this.eventPublisher.publishEvent({ event, type: eventType });
  }
}
