import { User } from 'src/domain/user/models/user';
import { internalServerError, notFound } from 'src/domain/exception/exceptions';
import { RabbitMQUserRepository } from 'src/infrastructure/rabbitmq/rabbitmq-user.repository';
import { UserRepositoryForConcurrencyControlTest } from 'src/infrastructure/user/concurrenctycontroltest/user.respository';
import { CashRepositoryForConcurrencyControlTest } from 'src/infrastructure/user/concurrenctycontroltest/cash.repository';
import { RedisRedLockRepository } from 'src/infrastructure/redis/redis.repositoryv1';
import { RedisPubSubLockRepository } from 'src/infrastructure/redis/redis.repositoryv3';
import { Lock } from 'redlock';
import { KafkaUserRepositoryTest } from 'src/infrastructure/kafka/kafka-user.repository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UserConcurrencyControlTestService {
  constructor(
    private readonly userRepositoryForConcurrencyControlTest: UserRepositoryForConcurrencyControlTest,
    private readonly kafkaUserRepositoryTest: KafkaUserRepositoryTest,
    private readonly rabbitMQUserRepository: RabbitMQUserRepository,
    private readonly cashRepositoryForConcurrencyControlTest: CashRepositoryForConcurrencyControlTest,
    private readonly redisRedLockRepository: RedisRedLockRepository,
    private readonly redisPubSubLockRepository: RedisPubSubLockRepository,
  ) {}

  /* 레디스 분산락(레드락 캐시 충전 */
  async cashChargeRedisRedLock(args: { userId: number; amount: number }) {
    let lock: Lock | null = null;
    try {
      lock = await this.redisRedLockRepository.acquireLock(
        `user_cash_charge:${args.userId}`,
        2000,
      );
      await this.cashCharge(args);
    } catch (e) {
      throw internalServerError(e, {
        cause: 'Failed to acquire lock',
      });
    } finally {
      this.redisRedLockRepository.releaseLock(lock);
    }
  }

  /* 레디스 분산락(레드락) 캐시 사용 */
  async cashUseRedisRedLock(args: { userId: number; amount: number }) {
    let lock: Lock | null = null;
    try {
      lock = await this.redisRedLockRepository.acquireLock(
        `user_cash_use:${args.userId}`,
        2000,
      );
      await this.cashUse(args);
    } catch (e) {
      throw internalServerError(e, {
        cause: 'Failed to acquire lock',
      });
    } finally {
      this.redisRedLockRepository.releaseLock(lock);
    }
  }

  /* 레디스 pub/sub 캐시 사용 */
  async cashUsePubSubLock(args: { userId: number; amount: number }) {
    try {
      await this.redisPubSubLockRepository.acquireLock(
        `user_cash_use:${args.userId}`,
        2000, // 실제로까지 걸리지 않는다.
      );
      await this.cashUse(args);
    } catch (e) {
      throw internalServerError(e, {
        cause: 'Failed to acquire lock',
      });
    } finally {
      await this.redisPubSubLockRepository.releaseLock(
        `user_cash_use:${args.userId}`,
      );
    }
  }

  /* 레디스 pub/sub 캐시 충전 */
  async cashChargePubSubLock(args: { userId: number; amount: number }) {
    try {
      await this.redisPubSubLockRepository.acquireLock(
        `user_cash_charge:${args.userId}`,
        2000, // 실제로까지 걸리지 않는다.
      );
      await this.cashCharge(args);
    } catch (e) {
      throw internalServerError(e, {
        cause: 'Failed to acquire lock',
      });
    } finally {
      await this.redisPubSubLockRepository.releaseLock(
        `user_cash_charge:${args.userId}`,
      );
    }
  }

  /* 비관락 캐시 사용 */
  async cashUsePessimisticLock(args: { userId: number; amount: number }) {
    return await this.userRepositoryForConcurrencyControlTest
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const user =
          await this.userRepositoryForConcurrencyControlTest.findByUserIdWithPessimisticLock(
            {
              userId: args.userId,
            },
            transactionalEntityManager,
          );
        if (!user)
          throw notFound('존재하지 않는 유저입니다.', {
            cause: `userId: ${args.userId} not found`,
          });
        user.cashUse(args.amount);
        return await this.userRepositoryForConcurrencyControlTest.save(
          user,
          transactionalEntityManager,
        );
      });
  }

  /* 비관락 캐시 충전 */
  async cashChargePessimisticLock(args: { userId: number; amount: number }) {
    return await this.userRepositoryForConcurrencyControlTest
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const user =
          await this.userRepositoryForConcurrencyControlTest.findByUserIdWithPessimisticLock(
            {
              userId: args.userId,
            },
            transactionalEntityManager,
          );
        if (!user)
          throw notFound('존재하지 않는 유저입니다.', {
            cause: `userId: ${args.userId} not found`,
          });
        user.cashCharge(args.amount);
        return await this.userRepositoryForConcurrencyControlTest.save(
          user,
          transactionalEntityManager,
        );
      });
  }

  /* 낙관락 캐시 충전 */
  async cashChargeOptimisticLock(args: { userId: number; amount: number }) {
    const user =
      await this.userRepositoryForConcurrencyControlTest.findByUserId({
        userId: args.userId,
      });
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    user.cashCharge(args.amount);
    return await this.cashRepositoryForConcurrencyControlTest.optimisticLockCashUpdate(
      { user },
    );
  }

  /* 낙관락 캐시 사용 */
  async cashUseOptimisticLock(args: { userId: number; amount: number }) {
    const user =
      await this.userRepositoryForConcurrencyControlTest.findByUserId({
        userId: args.userId,
      });
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    user.cashUse(args.amount);
    return await this.cashRepositoryForConcurrencyControlTest.optimisticLockCashUpdate(
      { user },
    );
  }

  /* 카프카 캐시 사용 */
  async cashUseSendKafkaMessage(args: { userId: number; amount: number }) {
    await this.kafkaUserRepositoryTest.sendMessageToCashUse(args);
  }

  /* 카프카 캐시 충전 */
  async cashChargeSendKafkaMessage(args: { userId: number; amount: number }) {
    await this.kafkaUserRepositoryTest.sendMessageToCashCharge(args);
  }
  /* 레빗앰큐 캐시 사용 */
  async cashUseSendRabbitMQMessage(args: { userId: number; amount: number }) {
    await this.rabbitMQUserRepository.sendMessageToCashUse(args);
  }

  /* 레빗엠큐 캐시 충전 */
  async cashChargeSendRabbitMQMessage(args: {
    userId: number;
    amount: number;
  }) {
    await this.rabbitMQUserRepository.sendMessageToCashCharge(args);
  }

  async cashCharge(args: any) {
    const user =
      await this.userRepositoryForConcurrencyControlTest.findByUserId({
        userId: args.userId,
      });
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    user.cashCharge(args.amount);
    return await this.userRepositoryForConcurrencyControlTest.save(user);
  }

  async cashUse(args: { userId: number; amount: number }) {
    try {
      const user =
        await this.userRepositoryForConcurrencyControlTest.findByUserId({
          userId: args.userId,
        });
      if (!user)
        throw notFound('존재하지 않는 유저입니다.', {
          cause: `userId: ${args.userId} not found`,
        });

      user.cashUse(args.amount);
      return await this.userRepositoryForConcurrencyControlTest.save(user);
    } catch (e) {
      throw e;
    }
  }

  async findUser(args: { userId: number }) {
    const user =
      await this.userRepositoryForConcurrencyControlTest.findByUserId(args);
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    return user;
  }

  async register(args: { name: string }) {
    const user = new User({ name: args.name });
    return await this.userRepositoryForConcurrencyControlTest.register(user);
  }
}
