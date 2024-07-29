import { Injectable } from '@nestjs/common';
import { RabbitMQBaseConsumer } from 'src/infrastructure/rabbitmq/base/rabbitmq.base.consumber';
import { internalServerError } from 'src/domain/exception/exceptions';
import { UserConcurrencyControlTestApp } from 'src/application/user/concurrenctycontroltest/user-concurrency-control-test.app';

@Injectable()
export class RabbitMQCashChargeHandlerTest extends RabbitMQBaseConsumer {
  constructor(
    private readonly userConcurrencyControlTestApp: UserConcurrencyControlTestApp,
  ) {
    super('user-cash-charge');
  }

  async handleMessage(message: any): Promise<void> {
    try {
      await this.userConcurrencyControlTestApp.cashCharge(message);
    } catch (e) {
      throw internalServerError('rabbitmq message handler Error', {
        cause: e,
      });
    }
  }
}
