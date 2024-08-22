import { Concert } from '../concert/models/concert';

enum OutboxStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export class Outbox {
  id: number;
  event: Concert;
  transactionId: string;
  eventType: string;
  status: OutboxStatus;

  constructor(args: {
    id?: number;
    event: string;
    status: OutboxStatus;
    transactionId: string;
    eventType: string;
  }) {
    if (args) {
      Object.assign(this, args);

      this.event = JSON.parse(args.event);
    }
  }
}
