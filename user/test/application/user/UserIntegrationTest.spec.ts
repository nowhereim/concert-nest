import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UserFacadeApp } from 'src/application/user/user.facade';

describe('UserFacade Integration Test', () => {
  let app: INestApplication;
  let userFacadeApp: UserFacadeApp;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    userFacadeApp = module.get<UserFacadeApp>(UserFacadeApp);

    await app.init();
  }, 60000);

  afterEach(async () => {
    await app.close();
  });

  describe('캐시 충전', () => {
    it('유저 포인트 충전', async () => {
      const user = await userFacadeApp.cashCharge({
        userId: 1,
        amount: 1000,
      });
      expect(user).toEqual({
        id: 1,
        name: expect.any(String),
        cash: {
          balance: 1000,
          id: expect.any(Number),
          userId: 1,
        },
      });
    });

    it('잘못된 값 충전 실패', async () => {
      await expect(
        userFacadeApp.cashCharge({
          userId: 1,
          amount: -1000,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('유저 없음 충전 실패', async () => {
      await expect(
        userFacadeApp.cashCharge({
          userId: 100000,
          amount: 1000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('캐시 사용', () => {
    it('잘못된 값 사용 실패', async () => {
      await expect(
        userFacadeApp.cashUse({
          userId: 1,
          amount: -1000,
          transactionId: 'test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('유저 포인트 사용', async () => {
      await userFacadeApp.cashCharge({
        userId: 1,
        amount: 1000,
      });
      const user = await userFacadeApp.cashUse({
        userId: 1,
        amount: 1000,
        transactionId: 'test',
      });
      expect(user).toEqual({
        id: 1,
        name: expect.any(String),
        cash: {
          balance: 0,
          id: expect.any(Number),
          userId: 1,
        },
      });
    });

    it('잔액 초과 실패', async () => {
      await expect(
        userFacadeApp.cashUse({
          userId: 1,
          amount: 1000000000,
          transactionId: 'test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('유저 없음 사용 실패', async () => {
      await expect(
        userFacadeApp.cashUse({
          userId: 100000,
          amount: 1000,
          transactionId: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('캐시 조회', () => {
    it('유저 포인트 조회', async () => {
      const user = await userFacadeApp.cashRead({
        userId: 1,
      });
      expect(user).toEqual({
        id: 1,
        name: expect.any(String),
        cash: {
          balance: expect.any(Number),
          id: expect.any(Number),
          userId: 1,
        },
      });
    });

    it('유저 없음 조회 실패', async () => {
      await expect(
        userFacadeApp.cashRead({
          userId: 100000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('유저 캐시 충전 동시성 테스트', () => {
    it('유저가 동시에 다수의 충전 요청을 할 경우 누락없이 모두 반영한다.', async () => {
      const promises = Array.from({ length: 10 }, () =>
        userFacadeApp.cashCharge({
          userId: 1,
          amount: 1000,
        }),
      );

      await Promise.all(promises);
      const getUserCash = await userFacadeApp.cashRead({
        userId: 1,
      });
      expect(getUserCash.cash.getBalance()).toBe(20000); //초기 시딩 값이 10000
    }, 60000);
  });

  describe('유저 캐시 사용 동시성 테스트', () => {
    it('유저가 동시에 다수의 캐시 사용 요청을 할 경우 낙관락을 활용하여 의도치 않은 포인트 차감을 방지한다.', async () => {
      const promises = Array.from({ length: 10 }, () =>
        userFacadeApp.cashUse({
          userId: 1,
          amount: 1000,
          transactionId: 'test',
        }),
      );

      await Promise.all(promises);
      const getUserCash = await userFacadeApp.cashRead({
        userId: 1,
      });
      expect(getUserCash.cash.getBalance()).toBe(9000); //초기 시딩 값이 10000
    }, 60000);
  });
});
