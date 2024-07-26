import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConcertConcurrencyControlTestApp } from '../concert-concurrency-control-test.app';
import { internalServerError } from 'src/domain/exception/exceptions';

@Injectable()
export class KafkaConcertMessageHandler extends KafkaBaseConsumer {
  constructor(
    private readonly concertConcurrencyControlTestApp: ConcertConcurrencyControlTestApp,
  ) {
    super('test-group', 'test');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.concertConcurrencyControlTestApp.seatReservation(message);
    } catch (e) {
      throw internalServerError('kafka message handler Error', {
        cause: e,
      });
    }
  }
}
