import { User } from 'src/domain/user/models/user';
import { BaseEvent } from 'src/domain/events/base/base.event';

export class UserEvent extends BaseEvent {
  constructor(args: {
    aggregateId?: number;
    op?: string;
    before?: User;
    after?: User;
    args?: any;
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
