import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UserConcurrencyControlTestApp } from 'src/application/user/concurrenctycontroltest/user-concurrency-control-test.app';
import { SeederService } from 'src/seed/seeder.service';
import { CustomLogger } from 'src/common/logger/logger';
import { promisify } from 'util';

describe('UserConcurrencyControlTestApp Integration Test', () => {
  let app: INestApplication;
  let seederService: SeederService;
  let userConcurrencyControlTestApp: UserConcurrencyControlTestApp;
  let customLogger: CustomLogger;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    seederService = module.get<SeederService>(SeederService);
    userConcurrencyControlTestApp = module.get<UserConcurrencyControlTestApp>(
      UserConcurrencyControlTestApp,
    );
    customLogger = module.get<CustomLogger>(CustomLogger);

    await seederService.seed();
    await app.init();
    await promisify(setTimeout)(5000);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('User Cash Concurrency Control Test', () => {
    it('캐시 사용 심플락 동시성 테스트', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const userId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const usage = await userConcurrencyControlTestApp.cashUseSimpleLock({
          userId,
          amount: 1,
        });

        return usage;
      });

      await Promise.allSettled(promises);
      const check = await userConcurrencyControlTestApp.cashRead({ userId });
      //기본 10000원 seed
      expect(check.cash.getBalance()).toBe(7000);

      expect(promises).toHaveLength(3000);

      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `캐시 사용 심플락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
        time: `${endTime - startTime} ms`,
        stack: '캐시 사용 심플락 동시성 테스트',
      });

      await promisify(setTimeout)(100);
    }, 60000);

    it('캐시 충전 심플락 동시성 테스트', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const userId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const charge = await userConcurrencyControlTestApp.cashChargeSimpleLock(
          {
            userId,
            amount: 1,
          },
        );

        return charge;
      });

      await Promise.allSettled(promises);
      const check = await userConcurrencyControlTestApp.cashRead({ userId });
      expect(check.cash.getBalance()).toBe(13000);
      expect(promises).toHaveLength(3000);

      const endTime = performance.now(); // 종료 시간 기록
      customLogger.testingLog({
        message: `캐시 충전 심플락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
        time: `${endTime - startTime} ms`,
        stack: '캐시 충전 심플락 동시성 테스트',
      });

      await promisify(setTimeout)(100);
    }, 60000);

    it('캐시 사용 Redis 분산락 동시성 테스트', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const userId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const usage = await userConcurrencyControlTestApp.cashUseRedisRedLock({
          userId,
          amount: 1,
        });

        return usage;
      });

      await Promise.allSettled(promises);
      const check = await userConcurrencyControlTestApp.cashRead({ userId });
      expect(check.cash.getBalance()).toBe(7000);
      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `캐시 사용 Redis 분산락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
        time: `${endTime - startTime} ms`,
        stack: '캐시 사용 Redis 분산락 동시성 테스트',
      });

      await promisify(setTimeout)(100);
    }, 60000);

    it('캐시 충전 Redis 분산락 동시성 테스트', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const userId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const charge =
          await userConcurrencyControlTestApp.cashChargeRedisRedLock({
            userId,
            amount: 1,
          });

        return charge;
      });

      await Promise.allSettled(promises);
      const check = await userConcurrencyControlTestApp.cashRead({ userId });
      expect(check.cash.getBalance()).toBe(13000);
      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `캐시 충전 Redis 분산락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
        time: `${endTime - startTime} ms`,
        stack: '캐시 충전 Redis 분산락 동시성 테스트',
      });

      await promisify(setTimeout)(100);
    }, 60000);

    // 추가적으로 비관락, 낙관락, Kafka, RabbitMQ 등 다른 락 방식에 대한 테스트도 유사한 형태로 작성할 수 있습니다.
  });

  it('캐시 충전 Redis pub/sub 동시성 테스트', async () => {
    const startTime = performance.now(); // 시작 시간 기록

    const userId = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const charge = await userConcurrencyControlTestApp.cashChargePubSubLock({
        userId,
        amount: 1,
      });

      return charge;
    });

    await Promise.allSettled(promises);
    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(13000);
    const endTime = performance.now(); // 종료 시간 기록

    customLogger.testingLog({
      message: `캐시 충전 Redis pub/sub 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 충전 Redis pub/sub 동시성 테스트',
    });

    await promisify(setTimeout)(60000);
  }, 60000); // 테스트 타임아웃 설정 (60초)

  it('캐시 사용 Redis pub/sub 동시성 테스트', async () => {
    const startTime = performance.now(); // 시작 시간 기록

    const userId = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const usage = await userConcurrencyControlTestApp.cashUsePubSubLock({
        userId,
        amount: 1,
      });

      return usage;
    });

    await Promise.allSettled(promises);
    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(7000);
    const endTime = performance.now(); // 종료 시간 기록

    customLogger.testingLog({
      message: `캐시 사용 Redis pub/sub 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 사용 Redis pub/sub 동시성 테스트',
    });

    await promisify(setTimeout)(100);
  }, 60000);

  it('캐시 사용 비관락 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const usage = await userConcurrencyControlTestApp.cashUsePessimisticLock({
        userId,
        amount,
      });

      return usage;
    });

    await Promise.allSettled(promises);
    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(7000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 사용 비관락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 사용 비관락 동시성 테스트',
    });

    await promisify(setTimeout)(100);
  }, 60000);

  it('캐시 충전 비관락 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const charge =
        await userConcurrencyControlTestApp.cashChargePessimisticLock({
          userId,
          amount,
        });

      return charge;
    });

    await Promise.allSettled(promises);
    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(13000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 충전 비관락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 충전 비관락 동시성 테스트',
    });

    await promisify(setTimeout)(100);
  }, 60000);

  it('캐시 사용 낙관락 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 10000 }, async () => {
      const usage = await userConcurrencyControlTestApp.cashUseOptimisticLock({
        userId,
        amount,
      });

      return usage;
    });

    await Promise.allSettled(promises);
    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(0);
    expect(promises).toHaveLength(10000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 사용 낙관락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 사용 낙관락 동시성 테스트',
    });

    await promisify(setTimeout)(100);
  }, 60000);

  it('캐시 충전 낙관락 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const charge =
        await userConcurrencyControlTestApp.cashChargeOptimisticLock({
          userId,
          amount,
        });

      return charge;
    });

    await Promise.allSettled(promises);
    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(10001);
    expect(promises).toHaveLength(3000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 충전 낙관락 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 충전 낙관락 동시성 테스트',
    });

    await promisify(setTimeout)(100);
  }, 60000);

  it('캐시 사용 Kafka 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const usage = await userConcurrencyControlTestApp.cashUseSendKafkaMessage(
        {
          userId,
          amount,
        },
      );

      return usage;
    });

    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(7000);

    await Promise.allSettled(promises);

    expect(promises).toHaveLength(30000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 사용 Kafka 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 사용 Kafka 동시성 테스트',
    });

    await promisify(setTimeout)(10000);
  }, 60000);

  it('캐시 충전 Kafka 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const charge =
        await userConcurrencyControlTestApp.cashChargeSendKafkaMessage({
          userId,
          amount,
        });

      return charge;
    });

    await Promise.allSettled(promises);

    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(13000);
    expect(promises).toHaveLength(3000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 충전 Kafka 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 충전 Kafka 동시성 테스트',
    });

    await promisify(setTimeout)(30000);
  }, 60000);

  it('캐시 사용 RabbitMQ 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const usage =
        await userConcurrencyControlTestApp.cashUseSendRabbitMQMessage({
          userId,
          amount,
        });

      return usage;
    });

    await Promise.allSettled(promises);

    expect(promises).toHaveLength(3000);

    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(7000);
    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 사용 RabbitMQ 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 사용 RabbitMQ 동시성 테스트',
    });

    await promisify(setTimeout)(60000);
  }, 60000);

  it('캐시 충전 RabbitMQ 동시성 테스트', async () => {
    const startTime = performance.now();

    const userId = 1;
    const amount = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const charge =
        await userConcurrencyControlTestApp.cashChargeSendRabbitMQMessage({
          userId,
          amount,
        });

      return charge;
    });

    await Promise.allSettled(promises);

    const check = await userConcurrencyControlTestApp.cashRead({ userId });
    expect(check.cash.getBalance()).toBe(13000);
    expect(promises).toHaveLength(3000);

    const endTime = performance.now();

    customLogger.testingLog({
      message: `캐시 충전 RabbitMQ 동시성 테스트 실행 시간: ${endTime - startTime} ms`,
      time: `${endTime - startTime} ms`,
      stack: '캐시 충전 RabbitMQ 동시성 테스트',
    });

    await promisify(setTimeout)(60000);
  }, 60000);
});
