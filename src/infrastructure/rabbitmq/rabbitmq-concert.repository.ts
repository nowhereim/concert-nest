import { Injectable } from '@nestjs/common';
import { RabbitMQBaseProducer } from 'src/infrastructure/rabbitmq/base/rabbitmq.base.producer';
import { QueueEnum } from 'src/infrastructure/rabbitmq/base/QueueEnum';

@Injectable()
export class RabbitMQConcertRepository extends RabbitMQBaseProducer {
  constructor() {
    super([QueueEnum.seatReservation]);
  }

  async sendMessageToReservationSeat(data: any) {
    return this.sendMessage(data, QueueEnum.seatReservation);
  }
}
