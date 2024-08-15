import { IEventPublisher } from './interface/event-publisher.interface';
import { Inject } from '@nestjs/common';
import { IConcertOutboxWriter } from './interface/concert-outbox-writer.interface';
import { BaseEventDispatcher } from './base/base.event-dispatcher';

export enum EventType {
  SEAT_RESERVATION_FAILED = 'seat-reservation-failed',
}

export enum OpType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
}

export class EventDispatcher extends BaseEventDispatcher {
  constructor(
    @Inject('IConcertOutboxWriter')
    concertOutboxWriter: IConcertOutboxWriter,
    @Inject('IEventPublisher')
    eventPublisher: IEventPublisher,
  ) {
    super(concertOutboxWriter, eventPublisher);
  }

  async seatDeactivateFailEvent(args: {
    args: object;
    transactionId?: string;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(event, EventType.SEAT_RESERVATION_FAILED);
    this.publishEvent(event, EventType.SEAT_RESERVATION_FAILED);
  }
}
