import { IEventPublisher } from './interface/event-publisher.interface';
import { Inject } from '@nestjs/common';
import { User } from 'src/domain/user/models/user';
import { IUserOutboxWriter } from 'src/domain/events/interface/user-outbox-writer.interface';
import { BaseEventDispatcher } from 'src/domain/events/base/base.event-dispatcher';
export enum EventType {
  CASH_CHARGE = 'cash-charge',
  CASH_USE = 'cash-use',
  CASH_USE_FAILED = 'cash-use-failed',
}
export enum OpType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
}
export class EventDispatcher extends BaseEventDispatcher {
  constructor(
    @Inject('IUserOutboxWriter')
    userOutboxWriter: IUserOutboxWriter,
    @Inject('IEventPublisher')
    eventPublisher: IEventPublisher,
  ) {
    super(userOutboxWriter, eventPublisher);
  }

  async cashUseEvent(args: {
    targetBefore?: User;
    targetAfter: User;
    args?: object;
    transactionId?: string;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(event, EventType.CASH_USE);
    this.publishEvent(event, EventType.CASH_USE);
  }

  async cashUseFailedEvent(args: {
    args: object;
    transactionId?: string;
  }): Promise<void> {
    const event = this.createEventArgs(args);
    await this.saveOutbox(event, EventType.CASH_USE_FAILED);
    this.publishEvent(event, EventType.CASH_USE_FAILED);
  }
}
