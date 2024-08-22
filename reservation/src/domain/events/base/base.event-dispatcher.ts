import { Inject } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { ReservationEvent } from 'src/domain/events/reservation.event';
import { IReservationOutboxWriter } from '../interface/reservation-outbox-reader.interface';
import { IEventPublisher } from '../interface/event-publisher.interface';
import { EventType } from '../event.dispatcher';

export class BaseEventDispatcher {
  constructor(
    @Inject('IReservationOutboxWriter')
    private readonly reservationOutboxWriter: IReservationOutboxWriter,

    @Inject('IEventPublisher')
    private readonly eventPublisher: IEventPublisher,
  ) {}
  protected createEventArgs(args: any): ReservationEvent {
    const transactionUUID = nanoid();
    return new ReservationEvent({
      aggregateId: args?.targetAfter?.id,
      op: args.operation,
      before: args?.targetBefore,
      after: args?.targetAfter,
      args: args?.args,
      transactionId: args.transactionId ?? transactionUUID,
    });
  }

  protected async saveOutbox(
    event: ReservationEvent,
    eventType: EventType,
    transactionalEntityManager?: any,
  ) {
    await this.reservationOutboxWriter.save(
      { event, transactionId: event.transactionId, eventType },
      transactionalEntityManager,
    );
  }

  protected publishEvent(event: ReservationEvent, eventType: EventType) {
    this.eventPublisher.publishEvent({ event, type: eventType });
  }
}
