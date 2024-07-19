import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/queue.service';
import { IQueueRepository } from 'src/domain/queue/i.queue.repository';
import { Queue, QueueStatusEnum } from 'src/domain/queue/queue';

describe('QueueService Unit Test', () => {
  let service: QueueService;
  let queueRepository: jest.Mocked<IQueueRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: 'IQueueRepository',
          useValue: {
            save: jest.fn(),
            findByUserId: jest.fn(),
            findByQueueId: jest.fn(),
            findExpiredActiveRecords: jest.fn(),
            findActiveRecordsCount: jest.fn(),
            findWaitingRecords: jest.fn(),
            saveAll: jest.fn(),
            findByQueueIdWaitingAhead: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    queueRepository = module.get('IQueueRepository');
  });

  describe('createQueue', () => {
    it('대기열 등록 성공', async () => {
      const mock = new Queue({
        id: 1,
        userId: 1,
        status: QueueStatusEnum.WAITING,
      });

      queueRepository.save.mockResolvedValue(mock);

      const queue = await service.createQueue({ userId: 1 });

      expect(queue).toEqual(mock);
    });
    it('이미 대기열에 존재하는 사람 실패', async () => {
      const userId = 1;
      const existingQueue = new Queue({
        id: 1,
        userId,
        status: QueueStatusEnum.WAITING,
      });
      queueRepository.findByUserId.mockResolvedValue(existingQueue);

      await expect(service.createQueue({ userId })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByQueueId', () => {
    it('큐 조회 성공', async () => {
      const mock = new Queue({
        id: 1,
        userId: 1,
        status: QueueStatusEnum.WAITING,
      });

      queueRepository.findByQueueId.mockResolvedValue(mock);
      queueRepository.findByQueueIdWaitingAhead.mockResolvedValue(null);

      const queue = await service.findByQueueId({ queueId: 1 });

      expect(queue).toEqual(mock);
    });
    it('존재하지 않는 큐 조회 실패', async () => {
      queueRepository.findByQueueId.mockResolvedValue(null);

      await expect(service.findByQueueId({ queueId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('inProgress', () => {
    it('큐 활성화 성공', async () => {
      const existingQueue = new Queue({
        id: 1,
        userId: 1,
        status: QueueStatusEnum.WAITING,
      });
      queueRepository.findByQueueId.mockResolvedValue(existingQueue);

      await service.inProgress({ queueId: 1 });

      expect(existingQueue.status).toBe(QueueStatusEnum.IN_PROGRESS);
      expect(queueRepository.findByQueueId).toHaveBeenCalled();
      expect(queueRepository.save).toHaveBeenCalled;
    });
    it('존재하지 않는 큐 활성 실패', async () => {
      queueRepository.findByQueueId.mockResolvedValue(null);

      await expect(service.inProgress({ queueId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('complete', () => {
    it('큐 완료 성공', async () => {
      const existingQueue = new Queue({
        id: 1,
        userId: 1,
        status: QueueStatusEnum.IN_PROGRESS,
      });
      queueRepository.findByQueueId.mockResolvedValue(existingQueue);

      await service.complete({ queueId: 1 });

      expect(existingQueue.status).toBe(QueueStatusEnum.COMPLETED);
      expect(queueRepository.findByQueueId).toHaveBeenCalled();
      expect(queueRepository.save).toHaveBeenCalled;
    });
    it('존재하지 않는 큐 완료 실패', async () => {
      queueRepository.findByQueueId.mockResolvedValue(null);

      await expect(service.complete({ queueId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('expire', () => {
    it('큐 만료 성공', async () => {
      const userId = 1;
      const existingQueue = new Queue({
        id: 1,
        userId,
        status: QueueStatusEnum.WAITING,
      });
      queueRepository.findByUserId.mockResolvedValue(existingQueue);

      await service.expire({ userId });

      expect(existingQueue.status).toBe(QueueStatusEnum.EXPIRED);
      expect(queueRepository.findByUserId).toHaveBeenCalled();
      expect(queueRepository.save).toHaveBeenCalled;
    });

    it('존재하지않는 큐 만료 실패', async () => {
      queueRepository.findByUserId.mockResolvedValue(null);

      await expect(service.expire({ userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateWaitingRecords', () => {
    it('남은 활성화 자리 만큼 대기 인원을 활성화', async () => {
      queueRepository.findActiveRecordsCount.mockResolvedValue(5);
      queueRepository.findWaitingRecords.mockResolvedValue([
        new Queue({
          id: 1,
          userId: 1,
          status: QueueStatusEnum.WAITING,
        }),
      ]);

      queueRepository.saveAll.mockResolvedValue([
        new Queue({
          id: 1,
          userId: 1,
          status: QueueStatusEnum.IN_PROGRESS,
        }),
      ]);

      const result = await service.activateWaitingRecords();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(QueueStatusEnum.IN_PROGRESS);
      expect(queueRepository.findActiveRecordsCount).toHaveBeenCalled();
      expect(queueRepository.findWaitingRecords).toHaveBeenCalled();
      expect(queueRepository.saveAll).toHaveBeenCalled();
    });
  });
});
