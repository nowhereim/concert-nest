import { Injectable } from '@nestjs/common';
import { RabbitMQBaseConsumer } from 'src/infrastructure/rabbitmq/base/rabbitmq.base.consumber';
import { ConcertConcurrencyControlTestApp } from 'src/application/concert/concurrencycontroltest/concert-concurrency-control-test.app';
import { internalServerError } from 'src/domain/exception/exceptions';

@Injectable()
export class RabbitMQConcertConsumerHandler extends RabbitMQBaseConsumer {
  constructor(
    private readonly concertConcurrencyControlTestApp: ConcertConcurrencyControlTestApp,
  ) {
    super('seat_reservation_queue');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.concertConcurrencyControlTestApp.seatReservation(message);
    } catch (e) {
      throw internalServerError('rabbitmq message handler Error', {
        cause: e,
      });
    }
  }
}
