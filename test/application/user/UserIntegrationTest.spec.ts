import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UserFacadeApp } from 'src/application/user/user.facade(app)';
import { SeederService } from 'src/seed/seeder.service';

describe('UserFacade Integration Test', () => {
  let app: INestApplication;
  let userFacadeApp: UserFacadeApp;
  let seederService: SeederService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    userFacadeApp = module.get<UserFacadeApp>(UserFacadeApp);
    seederService = module.get<SeederService>(SeederService);

    await app.init();
  });

  afterEach(async () => {
    await seederService.seed();
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

      await userFacadeApp.cashUse({
        userId: 1,
        amount: 1000,
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
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('유저 없음 사용 실패', async () => {
      await expect(
        userFacadeApp.cashUse({
          userId: 100000,
          amount: 1000,
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
});
