import { Payment } from '../payment/payment';
import { BaseEvent } from './base/base.event';

export class PaymentEvent extends BaseEvent {
  constructor(args: {
    aggregateId?: number;
    op: string;
    before?: Payment;
    after?: Payment;
    args?: object;
    transactionId?: string;
  }) {
    super();
    this.aggregateId = args.aggregateId;
    this.aggregateType = this.constructor.name;
    this.op = args.op;
    this.ts_ms = Date.now();
    this.before = args.before;
    this.after = args.after;
    this.args = args.args;
    this.transactionId = args.transactionId;
  }
}
