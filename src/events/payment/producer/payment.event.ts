// events/note-created.event.ts
import { IEvent } from '@nestjs/cqrs';
import { Payment } from 'src/domain/payment/payment';

export class PaymentEvent implements IEvent {
  constructor(
    public tranjactionId: string,
    public payment: Payment,
  ) {}
}
