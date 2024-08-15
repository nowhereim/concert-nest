import { Concert } from '../concert/models/concert';
import { BaseEvent } from './base/base.event';

export class ConcertEvent extends BaseEvent {
  constructor(args: {
    aggregateId?: number;
    op: string;
    before?: Concert;
    after?: Concert;
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
