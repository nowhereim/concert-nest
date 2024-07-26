import { Injectable } from '@nestjs/common';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { UserConcurrencyControlTestApp } from 'src/application/user/concurrenctycontroltest/user-concurrency-control-test.app';
import { internalServerError } from 'src/domain/exception/exceptions';

@Injectable()
export class KafkaCashUseHandlerTest extends KafkaBaseConsumer {
  constructor(
    private readonly userConcurrencyControlTestApp: UserConcurrencyControlTestApp,
  ) {
    super('cash-use-group', 'cash-use');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.userConcurrencyControlTestApp.cashUse(message);
    } catch (e) {
      throw internalServerError('kafka message handler Error', {
        cause: e,
      });
    }
  }
}
