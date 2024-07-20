import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';
import { SeederService } from 'src/seed/seeder.service';

describe('QueueFacade Integration Test', () => {
  let app: INestApplication;
  let queueFacadeApp: QueueFacadeApp;
  let seederService: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    queueFacadeApp = module.get<QueueFacadeApp>(QueueFacadeApp);
    seederService = module.get<SeederService>(SeederService);

    app = module.createNestApplication();
    await seederService.seed();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('대기열 등록', () => {
    it('대기열 등록 성공', async () => {
      const userId = 2;
      const queue = await queueFacadeApp.createQueue({ userId });
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
      await queueFacadeApp.createQueue({ userId });
      await expect(queueFacadeApp.createQueue({ userId })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('대기열 조회', () => {
    it('대기열 조회 성공', async () => {
      const userId = 55;
      const queue = await queueFacadeApp.createQueue({ userId });
      const findQueue = await queueFacadeApp.findByQueueId({
        queueId: queue.id,
      });
      expect(findQueue).toEqual(queue);
    });

    it('대기열 조회 실패', async () => {
      await expect(
        queueFacadeApp.findByQueueId({
          queueId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('대기열 만료', () => {
    it('만료된 대기열 상태 변경 성공', async () => {
      const expiredQueue = await queueFacadeApp.expireQueue();
      expect(expiredQueue).toEqual([]);
    });
  });

  describe('대기열 활성화', () => {
    it('대기열 활성화 성공', async () => {
      const activeQueue = await queueFacadeApp.activeQueue();
      expect(activeQueue).toEqual([]);
    });
  });
});
