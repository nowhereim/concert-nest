import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';

describe('QueueFacade Integration Test', () => {
  let app: INestApplication;
  let queueFacadeApp: QueueFacadeApp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    queueFacadeApp = module.get<QueueFacadeApp>(QueueFacadeApp);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('대기열 등록', () => {
    it('대기열 등록 성공', async () => {
      const userId = 2;
      const queue = await queueFacadeApp.registerQueue({ userId });
      expect(queue).toEqual({
        id: expect.any(Number),
        userId,
        status: 'WAITING',
        createdAt: expect.any(Date),
        expiredAt: null,
      });
    });

    it('이미 대기열이 존재하는 경우 등록 실패', async () => {
      const userId = 2;
      await queueFacadeApp.registerQueue({ userId });
      await expect(
        await queueFacadeApp.registerQueue({ userId }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('대기열 조회', () => {
    it('대기열 조회 성공', async () => {
      const userId = 55;
      const queue = await queueFacadeApp.registerQueue({ userId });
      const findQueue = await queueFacadeApp.validToken({
        queueId: queue.id,
      });
      expect(findQueue).toEqual(queue);
    });

    it('대기열 조회 실패', async () => {
      await expect(
        queueFacadeApp.validToken({
          queueId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('대기열 활성화', () => {
    it('대기열 활성화 성공', async () => {
      const activeQueue = await queueFacadeApp.activateWaitingRecords();
      expect(activeQueue).toHaveBeenCalled();
    });
  });

  describe('대기열 만료', () => {
    it('대기열 만료 성공', async () => {
      const userId = 2;
      await queueFacadeApp.registerQueue({ userId });
      await queueFacadeApp.expireToken({ userId });
      await expect(
        queueFacadeApp.validToken({
          queueId: userId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
