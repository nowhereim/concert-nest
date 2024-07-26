import { Injectable } from '@nestjs/common';
import { RabbitMQBaseProducer } from 'src/infrastructure/rabbitmq/base/rabbitmq.base.producer';
import { QueueEnum } from './base/QueueEnum';

@Injectable()
export class RabbitMQUserRepository extends RabbitMQBaseProducer {
  constructor() {
    super([QueueEnum.userCashCharge, QueueEnum.userCashUse]);
  }

  async sendMessageToCashCharge(data: any) {
    return this.sendMessage(data, QueueEnum.userCashCharge);
  }

  async sendMessageToCashUse(data: any) {
    return this.sendMessage(data, QueueEnum.userCashUse);
  }
}
