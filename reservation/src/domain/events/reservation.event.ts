import { SeatReservation } from '../reservation/seat.reservation';
import { BaseEvent } from './base/base.event';

export class ReservationEvent extends BaseEvent {
  constructor(args: {
    aggregateId?: number;
    op: string;
    before?: SeatReservation;
    after?: SeatReservation;
    args?: object;
    transactionId?: string;
  }) {
    super();
    this.aggregateId = args.aggregateId;
    this.aggregateType = this.constructor.name; // 'SeatReservationEvent'
    this.op = args.op;
    this.ts_ms = Date.now();
    this.before = args.before;
    this.after = args.after;
    this.args = args.args;
    this.transactionId = args.transactionId;
  }
}
