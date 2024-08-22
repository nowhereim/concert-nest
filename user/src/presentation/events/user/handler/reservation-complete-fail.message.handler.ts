import { Injectable } from '@nestjs/common';
import { UserFacadeApp } from 'src/application/user/user.facade';
import { KafkaBaseConsumer } from 'src/infrastructure/kafka/base/kafka.base.consumer';
import { ConsumerGroup, ConsumerType } from '../enum/consumer-type.enum';

@Injectable()
export class ReservationCompleteFailEventHandler extends KafkaBaseConsumer {
  constructor(private readonly userFacadeApp: UserFacadeApp) {
    super(
      ConsumerGroup.COMPLETE_RESERVATION_FAILED_HANDLER_GROUP,
      ConsumerType.COMPLETE_RESERVATION_FAILED,
    );
  }
  async handleMessage(message: any): Promise<void> {
    await this.userFacadeApp.cashCharge({
      userId: message.after.userId,
      amount: message.after.totalAmount,
    });
  }
}
