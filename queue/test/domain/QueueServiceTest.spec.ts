import { Test, TestingModule } from '@nestjs/testing';
import { badRequest, notFound } from 'src/domain/exception/exceptions';
import { Queue, QueueStatusEnum } from 'src/domain/queue/models/queue';
import { QueueService } from 'src/domain/queue/queue.service';
import { IQueueRepository } from 'src/domain/queue/repositories/queue.repository.interface';

describe('QueueService', () => {
  let service: QueueService;
  let queueRepository: jest.Mocked<IQueueRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: 'IQueueRepository',
          useValue: {
            registerWaitingQueue: jest.fn(),
            clearActiveToken: jest.fn(),
            findByUserIdWatingPosition: jest.fn(),
            findByUserIdExistActiveToken: jest.fn(),
            moveToActiveToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    queueRepository = module.get('IQueueRepository');
  });

  describe('registerQueue', () => {
    it('이미 대기열에 등록된 경우 실패', async () => {
      queueRepository.registerWaitingQueue.mockResolvedValue(null);

      await expect(service.registerQueue({ userId: 1 })).rejects.toThrowError(
        badRequest('이미 대기열에 등록되어 있습니다.', {
          cause: `userId: 1 already in queue`,
        }),
      );
    });
  });

  describe('expireToken', () => {
    it('토큰 만료 성공', async () => {
      await expect(service.expireToken({ userId: 1 })).resolves.not.toThrow();
      expect(queueRepository.clearActiveToken).toHaveBeenCalledWith(1);
    });
  });

  describe('validToken', () => {
    it('대기열에 없는 경우, 활성 토큰이 없을 경우 실패', async () => {
      queueRepository.findByUserIdWatingPosition.mockResolvedValue(null);
      queueRepository.findByUserIdExistActiveToken.mockResolvedValue(null);

      await expect(service.validToken({ queueId: 1 })).rejects.toThrowError(
        notFound('대기열을 찾을 수 없습니다.', {
          cause: `queueId: 1 not found`,
        }),
      );
    });

    it('대기열에 없지만, 활성 토큰이 있을 경우 진행 상태 반환', async () => {
      queueRepository.findByUserIdWatingPosition.mockResolvedValue(null);
      queueRepository.findByUserIdExistActiveToken.mockResolvedValue(1);

      const result = await service.validToken({ queueId: 1 });

      expect(result).toEqual(
        new Queue({
          id: 1,
          status: QueueStatusEnum.IN_PROGRESS,
        }),
      );
    });

    it('대기열에 있는 경우, 대기 상태 반환', async () => {
      queueRepository.findByUserIdWatingPosition.mockResolvedValue(5);

      const result = await service.validToken({ queueId: 1 });

      expect(result).toEqual(
        new Queue({
          id: 1,
          waitingPosition: 5,
          status: QueueStatusEnum.WAITING,
        }),
      );
    });
  });

  describe('activateWaitingRecords', () => {
    it('대기열 활성화 성공', async () => {
      await service.activateWaitingRecords();

      expect(queueRepository.moveToActiveToken).toHaveBeenCalledWith(
        9999,
        5 * 60,
      );
    });
  });
});
