import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { UserConcurrencyControlTestApp } from 'src/application/user/concurrenctycontroltest/user-concurrency-control-test.app';
import { internalServerError } from 'src/domain/exception/exceptions';

@Injectable()
export class KafkaCashChargeHandlerTest extends KafkaBaseConsumer {
  constructor(
    private readonly userConcurrencyControlTestApp: UserConcurrencyControlTestApp,
  ) {
    super('cash-charge-group', 'cash-charge');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.userConcurrencyControlTestApp.cashCharge(message);
    } catch (e) {
      throw internalServerError('kafka message handler Error', {
        cause: e,
      });
    }
  }
}
