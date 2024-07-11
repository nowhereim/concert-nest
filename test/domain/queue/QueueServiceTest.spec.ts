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
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    queueRepository = module.get('IQueueRepository');
  });

  describe('createQueue', () => {
    it('Queue가 이미 존재하면 BadRequestException을 던져야 함', async () => {
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
    it('Queue를 찾지 못하면 NotFoundException을 던져야 함', async () => {
      queueRepository.findByQueueId.mockResolvedValue(null);

      await expect(service.findByQueueId({ queueId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('inProgress', () => {
    it('Queue를 찾지 못하면 NotFoundException을 던져야 함', async () => {
      queueRepository.findByQueueId.mockResolvedValue(null);

      await expect(service.inProgress({ queueId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('complete', () => {
    it('Queue를 찾지 못하면 NotFoundException을 던져야 함', async () => {
      queueRepository.findByQueueId.mockResolvedValue(null);

      await expect(service.complete({ queueId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('expire', () => {
    it('Queue를 찾지 못하면 NotFoundException을 던져야 함', async () => {
      queueRepository.findByUserId.mockResolvedValue(null);

      await expect(service.expire({ userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateWaitingRecords', () => {
    it('활성화된 기록이 최대치를 초과하지 않으면 대기 기록을 활성화해야 함', async () => {
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
