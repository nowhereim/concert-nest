import { Test, TestingModule } from '@nestjs/testing';
import { CashHistoryService } from 'src/domain/user/cash-history.service';
import { ICashHistoryRepository } from 'src/domain/user/repository/i.cash-history.repository';
import { CashHistoryType } from 'src/domain/user/models/cash-history';
import { BadRequestException } from '@nestjs/common';

describe('CashHistoryService', () => {
  let service: CashHistoryService;
  let cashHistoryRepository: jest.Mocked<ICashHistoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashHistoryService,
        {
          provide: 'ICashHistoryRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CashHistoryService>(CashHistoryService);
    cashHistoryRepository = module.get('ICashHistoryRepository');
  });

  describe('createChargeHistory', () => {
    it('충전 기록 생성', async () => {
      await service.createChargeHistory({ userId: 1, amount: 100 });

      expect(cashHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 100,
          type: CashHistoryType.CHARGE,
        }),
      );
    });

    it('잘못된 금액 기록 실패', async () => {
      cashHistoryRepository.save.mockRejectedValue(new BadRequestException());
      await expect(
        service.createChargeHistory({ userId: 1, amount: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('음수 금액 기록 실패', async () => {
      cashHistoryRepository.save.mockRejectedValue(new BadRequestException());
      await expect(
        service.createChargeHistory({ userId: 1, amount: -10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createUseHistory', () => {
    it('사용 기록 생성', async () => {
      await service.createUseHistory({ userId: 1, amount: 50 });

      expect(cashHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 50,
          type: CashHistoryType.USE,
        }),
      );
    });

    it('잘못된 금액 기록 실패', async () => {
      cashHistoryRepository.save.mockRejectedValue(new BadRequestException());

      await expect(
        service.createUseHistory({ userId: 1, amount: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('음수 금액 기록 실패', async () => {
      cashHistoryRepository.save.mockRejectedValue(new BadRequestException());
      await expect(
        service.createChargeHistory({ userId: 1, amount: -10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
