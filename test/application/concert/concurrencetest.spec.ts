import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { ConcertConcurrencyControlTestApp } from 'src/application/concert/concurrencycontroltest/concert-concurrency-control-test.app';
import { SeederService } from 'src/seed/seeder.service';
import { CustomLogger } from 'src/common/logger/logger';
import { promisify } from 'util';

describe('ConcertFacade Integration Test', () => {
  let app: INestApplication;
  let seederService: SeederService;
  let concertConcurrencyControlTestApp: ConcertConcurrencyControlTestApp;
  let customLogger: CustomLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    seederService = module.get<SeederService>(SeederService);
    concertConcurrencyControlTestApp =
      module.get<ConcertConcurrencyControlTestApp>(
        ConcertConcurrencyControlTestApp,
      );

    customLogger = module.get<CustomLogger>(CustomLogger);

    await seederService.seed();
    await app.init();
    await promisify(setTimeout)(5000); // 5초 대기
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('좌석 점유 동시성 테스트 ', () => {
    it('좌석 점유 동시성 테스트 (simpleLock)', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const concertId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const reservation = await concertConcurrencyControlTestApp.simpleLock({
          concertId,
          seatId: 1,
        });

        return reservation;
      });

      await Promise.allSettled(promises);
      const getSeat = await concertConcurrencyControlTestApp.getSeatForTest(1);
      const version = getSeat.version;
      expect(version).toBe(2);

      expect(promises).toHaveLength(3000);

      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `좌석 점유 동시성 테스트 실행 시간: ${endTime - startTime} ms , 테스트 케이스 : 좌석 점유 동시성 테스트 (심플락)'`,
        time: `${endTime - startTime} ms`,
        stack: '좌석 점유 동시성 테스트 (심플락)',
      });
    }, 30000); // 테스트 타임아웃 설정 (30초)

    it('좌석 점유 동시성 테스트 (spinLock)', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const concertId = 1;

      const promises = Array.from({ length: 2 }, async () => {
        const reservation = await concertConcurrencyControlTestApp.spinLock({
          concertId,
          seatId: 1,
        });

        return reservation;
      });

      const results = await Promise.allSettled(promises);

      // 결과 분석
      const fulfilled = results.filter(
        (result) => result.status === 'fulfilled',
      );
      const rejected = results.filter((result) => result.status === 'rejected');

      expect(promises).toHaveLength(2);
      expect(fulfilled).toHaveLength(1); // 성공한 결과는 1개
      expect(rejected).toHaveLength(1);

      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `좌석 점유 동시성 테스트 실행 시간: ${endTime - startTime} ms , 테스트 케이스 : 좌석 점유 동시성 테스트 (스핀락)'`,
        time: `${endTime - startTime} ms`,
        stack: '좌석 점유 동시성 테스트 (스핀락)',
      });
    });
  });

  describe('좌석 점유 동시성 테스트 redisDistributedLockLock', () => {
    it('좌석 점유 동시성 테스트 (redis:redlock)', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const concertId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const reservation =
          await concertConcurrencyControlTestApp.redisDistributedLock({
            concertId,
            seatId: 1,
          });

        return reservation;
      });

      await Promise.allSettled(promises);

      const getSeat = await concertConcurrencyControlTestApp.getSeatForTest(1);
      const version = getSeat.version;
      expect(version).toBe(2);

      const endTime = performance.now(); // 종료 시간 기록
      customLogger.testingLog({
        message: `좌석 점유 동시성 테스트 실행 시간: ${endTime - startTime} ms , 테스트 케이스 : 좌석 점유 동시성 테스트 (레디스 레드락(분산락)))'`,
        time: `${endTime - startTime} ms`,
        stack: '좌석 점유 동시성 테스트 (레디스 레드락(분산락))',
      });
    }, 60000); // 테스트 타임아웃 설정 (30초)
  });

  describe('좌석 점유 동시성 테스트 (kafka)', () => {
    it('좌석 점유 동시성 테스트 (kafka)', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const concertId = 1;
      const seatId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const reservation =
          await concertConcurrencyControlTestApp.KafkaConcurrencyControlTest({
            concertId,
            seatId,
          });

        return reservation;
      });

      await Promise.allSettled(promises);

      const getSeat = await concertConcurrencyControlTestApp.getSeatForTest(1);
      const version = getSeat.version;
      expect(version).toBe(2);
      await new Promise((resolve) => setTimeout(resolve, 10)); // 1초 대기

      expect(promises).toHaveLength(3000);
      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `좌석 점유 동시성 테스트 실행 시간: ${endTime - startTime} ms , 테스트 케이스 : 좌석 점유 동시성 테스트 (카프카)'`,
        time: `${endTime - startTime} ms`,
        stack: '좌석 점유 동시성 테스트 (카프카)',
      });
      await promisify(setTimeout)(100);
    });
  });

  describe('좌석 점유 동시성 테스트 (rabbitMQ)', () => {
    it('좌석 점유 동시성 테스트 (rabbitMQ)', async () => {
      const startTime = performance.now(); // 시작 시간 기록

      const concertId = 1;

      const promises = Array.from({ length: 3000 }, async () => {
        const reservation =
          await concertConcurrencyControlTestApp.RabbitMQConcurrencyControlTest(
            {
              concertId,
              seatId: 1,
            },
          );

        return reservation;
      });

      await Promise.allSettled(promises);

      await new Promise((resolve) => setTimeout(resolve, 10)); // 1초 대기
      const getSeat = await concertConcurrencyControlTestApp.getSeatForTest(1);
      const version = getSeat.version;
      expect(version).toBe(2);
      expect(promises).toHaveLength(3000);

      const endTime = performance.now(); // 종료 시간 기록

      customLogger.testingLog({
        message: `좌석 점유 동시성 테스트 실행 시간: ${endTime - startTime} ms , 테스트 케이스 : 좌석 점유 동시성 테스트 (래빗엠큐)'`,
        time: `${endTime - startTime} ms`,
        stack: '좌석 점유 동시성 테스트 (래빗엠큐)',
      });
    });
  });

  it('좌석 점유 동시성 테스트 (pub/sub)Lock', async () => {
    const startTime = performance.now(); // 시작 시간 기록

    const concertId = 1;

    const promises = Array.from({ length: 3000 }, async () => {
      const reservation = await concertConcurrencyControlTestApp.pubSubLock({
        concertId,
        seatId: 1,
      });

      return reservation;
    });

    await Promise.allSettled(promises);
    const getSeat = await concertConcurrencyControlTestApp.getSeatForTest(1);
    const version = getSeat.version;
    expect(version).toBe(2);

    const endTime = performance.now(); // 종료 시간 기록

    customLogger.testingLog({
      message: `좌석 점유 동시성 테스트 실행 시간: ${endTime - startTime} ms , 테스트 케이스 : 좌석 점유 동시성 테스트 (퍼브섭락)'`,
      time: `${endTime - startTime} ms`,
      stack: '좌석 점유 동시성 테스트 (퍼브섭락)',
    });

    await promisify(setTimeout)(100);
  }, 30000);
});
