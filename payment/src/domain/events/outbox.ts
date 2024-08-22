enum OutboxStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export class Outbox {
  id: number;
  event: any;
  transactionId: string;
  eventType: string;
  status: OutboxStatus;

  constructor(args: {
    id?: number;
    event: any;
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
