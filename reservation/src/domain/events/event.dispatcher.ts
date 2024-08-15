import { IEventPublisher } from './interface/event-publisher.interface';
import { Inject } from '@nestjs/common';
import { SeatReservation } from '../reservation/seat.reservation';
import { IReservationOutboxWriter } from './interface/reservation-outbox-reader.interface';
import { IReservationOutboxReader } from './interface/reservation-outbox-writer.interface';
import { BaseEventDispatcher } from './base/base.event-dispatcher';
export enum EventType {
  RESERVATION_CREATED = 'reservation-seat',
  RESERVATION_COMPLETED = 'complete-reservation',
  RESERVATION_COMPLETE_FAILED = 'complete-reservation-failed',
  RESERVATIONS_EXPIRED = 'expired-reservations',
}

export enum OpType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
}
export class EventDispatcher extends BaseEventDispatcher {
  constructor(
    @Inject('IReservationOutboxReader')
    private readonly reservationOutboxReader: IReservationOutboxReader,

    @Inject('IReservationOutboxWriter')
    reservationOutboxWriter: IReservationOutboxWriter,

    @Inject('IEventPublisher')
    eventPublisher: IEventPublisher,
  ) {
    super(reservationOutboxWriter, eventPublisher);
  }

  async completeReservationEvent(args: {
    targetBefore?: SeatReservation;
    targetAfter: SeatReservation;
    args?: object;
    transactionId?: string;
    transactionalEntityManager?: any;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(
      event,
      EventType.RESERVATION_COMPLETED,
      args.transactionalEntityManager,
    );
    this.publishEvent(event, EventType.RESERVATION_COMPLETED);
  }

  async completeReservationFailEvent(args: {
    args: object;
    transactionId?: string;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(event, EventType.RESERVATION_COMPLETE_FAILED);
    this.publishEvent(event, EventType.RESERVATION_COMPLETE_FAILED);
  }

  async registerReservationEvent(args: {
    targetAfter: SeatReservation;
    args?: object;
    transactionId?: string;
    transactionalEntityManager?: any;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(
      event,
      EventType.RESERVATION_CREATED,
      args.transactionalEntityManager,
    );
    this.publishEvent(event, EventType.RESERVATION_CREATED);
  }

  async expiredReservationsEvent(args: {
    targetBefore: SeatReservation[];
    targetAfter: SeatReservation[];
    args?: object;
    transactionId?: string;
    transactionalEntityManager?: any;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(
      event,
      EventType.RESERVATIONS_EXPIRED,
      args.transactionalEntityManager,
    );
    this.publishEvent(event, EventType.RESERVATIONS_EXPIRED);
  }

  /* TODO: 추후에는 자신의 관심사 (메시지) 아웃박스테이블만 작동하도록 수정 필요. */
  async reprocessPendingEvents() {
    const pendingEvents =
      await this.reservationOutboxReader.findPendingEvents();
    for (const pendingEvent of pendingEvents) {
      this.publishEvent(pendingEvent.event, pendingEvent.eventType);
    }
  }
}
