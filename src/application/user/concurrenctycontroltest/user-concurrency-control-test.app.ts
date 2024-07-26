import { Injectable } from '@nestjs/common';
import { internalServerError } from 'src/domain/exception/exceptions';
import { UserConcurrencyControlTestService } from 'src/domain/user/concurrenctycontroltest/user-concurrency-control-test.service';
import { User } from 'src/domain/user/models/user';
/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class UserConcurrencyControlTestApp {
  private simpleLockStatus = false;

  constructor(
    private readonly userConcurrencyControlTestService: UserConcurrencyControlTestService,
  ) {}

  /* 캐시 사용 심플락 */
  async cashUseSimpleLock(args: { userId: number; amount: number }) {
    while (this.simpleLockStatus) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.simpleLockStatus = true;
    try {
      await this.userConcurrencyControlTestService.cashUse(args);
    } catch (e) {
      throw internalServerError('Lock Error');
    } finally {
      this.simpleLockStatus = false;
    }
  }

  /* 캐시 충전 심플락 */
  async cashChargeSimpleLock(args: { userId: number; amount: number }) {
    while (this.simpleLockStatus) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.simpleLockStatus = true;
    try {
      await this.userConcurrencyControlTestService.cashCharge(args);
    } catch (e) {
      throw internalServerError('Lock Error');
    } finally {
      this.simpleLockStatus = false;
    }
  }

  /* 레디스 레드락 캐시 사용 */
  async cashUseRedisRedLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUseRedisRedLock(
      args,
    );
  }

  /* 레디스 레드락 캐시 충전 */
  async cashChargeRedisRedLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashChargeRedisRedLock(
      args,
    );
  }

  /* 레디스 pub/sub락 캐시 사용*/
  async cashUsePubSubLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUsePubSubLock(args);
  }

  /* 레디스 pub/sub락 캐시 충전 */
  async cashChargePubSubLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashChargePubSubLock(
      args,
    );
  }

  /* 비관락 캐시 사용 */
  async cashUsePessimisticLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUsePessimisticLock(
      args,
    );
  }

  /* 비관락 캐시 충전 */
  async cashChargePessimisticLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashChargePessimisticLock(
      args,
    );
  }

  /* 낙관락 캐시 사용 */
  async cashUseOptimisticLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUseOptimisticLock(
      args,
    );
  }

  /* 낙관락 캐시 충전 */
  async cashChargeOptimisticLock(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashChargeOptimisticLock(
      args,
    );
  }

  /* 카프카 캐시 충전 */
  async cashChargeSendKafkaMessage(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashChargeSendKafkaMessage(
      args,
    );
  }

  /* 카프카 캐시 사용 */
  async cashUseSendKafkaMessage(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUseSendKafkaMessage(
      args,
    );
  }

  /* 레빗엠큐 캐시 사용 */
  async cashUseSendRabbitMQMessage(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUseSendRabbitMQMessage(
      args,
    );
  }

  /* 레빗엠큐 캐시 충전 */
  async cashChargeSendRabbitMQMessage(args: {
    userId: number;
    amount: number;
  }) {
    return await this.userConcurrencyControlTestService.cashChargeSendRabbitMQMessage(
      args,
    );
  }

  /* 기본 충전 */
  async cashCharge(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashCharge(args);
  }

  /* 기본 사용 */
  async cashUse(args: { userId: number; amount: number }) {
    return await this.userConcurrencyControlTestService.cashUse(args);
  }

  async cashRead(args: { userId: number }): Promise<User> {
    return await this.userConcurrencyControlTestService.findUser(args);
  }
}
