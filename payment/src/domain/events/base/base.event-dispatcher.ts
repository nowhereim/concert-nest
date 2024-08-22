import { Inject } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { EventType } from 'src/domain/events/event.dispatcher';
import { PaymentEvent } from '../payment.event';
import { IPaymentOutboxWriter } from '../interface/payment-outbox-writer.interface';
import { IEventPublisher } from '../interface/event-publisher.interface';

export class BaseEventDispatcher {
  constructor(
    @Inject('IPaymentOutboxWriter')
    private readonly paymentOutboxWriter: IPaymentOutboxWriter,
    @Inject('IEventPublisher')
    private readonly eventPublisher: IEventPublisher,
  ) {}
  protected createEventArgs(args: any): PaymentEvent {
    const transactionUUID = nanoid();
    return new PaymentEvent({
      aggregateId: args?.targetAfter?.id,
      op: args.operation,
      before: args?.targetBefore,
      after: args?.targetAfter,
      args: args?.args,
      transactionId: args.transactionId ?? transactionUUID,
    });
  }

  protected async saveOutbox(
    event: PaymentEvent,
    eventType: EventType,
    transactionalEntityManager?: any,
  ) {
    await this.paymentOutboxWriter.save(
      { event, transactionId: event.transactionId, eventType },
      transactionalEntityManager,
    );
  }

  protected publishEvent(event: PaymentEvent, eventType: EventType) {
    this.eventPublisher.publishEvent({ event, type: eventType });
  }
}
