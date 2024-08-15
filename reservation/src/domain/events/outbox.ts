enum OutboxStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export class Outbox {
  id: number;
  event: any;
  transactionId: string;
  eventType: any;
  status: OutboxStatus;

  constructor(args: {
    id?: number;
    event: any;
    status: OutboxStatus;
    transactionId: string;
    eventType: any;
  }) {
    if (args) {
      Object.assign(this, args);

      this.event = JSON.parse(args.event);
    }
  }
}
