import { IEventPublisher } from './interface/event-publisher.interface';
import { Inject } from '@nestjs/common';
import { Payment } from '../payment/payment';
import { IPaymentOutboxWriter } from './interface/payment-outbox-writer.interface';
import { BaseEventDispatcher } from './base/base.event-dispatcher';

export enum EventType {
  PAYMENT = 'PAYMENT',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export enum OpType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
}

export class EventDispatcher extends BaseEventDispatcher {
  constructor(
    @Inject('IPaymentOutboxWriter')
    paymentOutboxWriter: IPaymentOutboxWriter,
    @Inject('IEventPublisher')
    eventPublisher: IEventPublisher,
  ) {
    super(paymentOutboxWriter, eventPublisher);
  }

  async payEvent(args: {
    targetAfter: Payment;
    args: object;
    transactionId?: string;
    transactionalEntityManager?: any;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(
      event,
      EventType.PAYMENT,
      args.transactionalEntityManager,
    );
    this.publishEvent(event, EventType.PAYMENT);
  }

  async completePaymentEvent(args: {
    args: object;
    transactionId?: string;
    transactionalEntityManager?: any;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(
      event,
      EventType.PAYMENT_COMPLETED,
      args.transactionalEntityManager,
    );
    this.publishEvent(event, EventType.PAYMENT_COMPLETED);
  }

  async completeFailPaymentEvent(args: {
    targetAfter: Payment;
    targetBefor: Payment;
    args?: object;
    transactionId?: string;
    transactionalEntityManager?: any;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(
      event,
      EventType.PAYMENT_FAILED,
      args.transactionalEntityManager,
    );
    this.publishEvent(event, EventType.PAYMENT_FAILED);
  }
}
