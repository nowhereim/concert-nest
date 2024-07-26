import { Injectable } from '@nestjs/common';
import { RabbitMQBaseConsumer } from 'src/infrastructure/rabbitmq/base/rabbitmq.base.consumber';
import { internalServerError } from 'src/domain/exception/exceptions';
import { UserConcurrencyControlTestApp } from 'src/application/user/concurrenctycontroltest/user-concurrency-control-test.app';

@Injectable()
export class RabbitMQCashUseHandlerTest extends RabbitMQBaseConsumer {
  constructor(
    private readonly userConcurrencyControlTestApp: UserConcurrencyControlTestApp,
  ) {
    super('user-cash-use');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.userConcurrencyControlTestApp.cashUse(message);
    } catch (e) {
      throw internalServerError('rabbitmq message handler Error', {
        cause: e,
      });
    }
  }
}
