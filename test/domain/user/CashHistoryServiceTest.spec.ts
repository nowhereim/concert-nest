import { Test, TestingModule } from '@nestjs/testing';
import { CashHistoryService } from 'src/domain/user/cash-history.service';
import { ICashHistoryRepository } from 'src/domain/user/repository/i.cash-history.repository';
import { CashHistoryType } from 'src/domain/user/models/cash-history';

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
    it('충전 기록을 성공적으로 생성해야 함', async () => {
      await service.createChargeHistory({ userId: 1, amount: 100 });

      expect(cashHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 100,
          type: CashHistoryType.CHARGE,
        }),
      );
    });

    it('충전 기록을 저장할 때 오류가 발생하면 예외를 던져야 함', async () => {
      cashHistoryRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createChargeHistory({ userId: 1, amount: 100 }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('createUseHistory', () => {
    it('사용 기록을 성공적으로 생성해야 함', async () => {
      await service.createUseHistory({ userId: 1, amount: 50 });

      expect(cashHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 50,
          type: CashHistoryType.USE,
        }),
      );
    });

    it('사용 기록을 저장할 때 오류가 발생하면 예외를 던져야 함', async () => {
      cashHistoryRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createUseHistory({ userId: 1, amount: 50 }),
      ).rejects.toThrow('Database error');
    });
  });
});
