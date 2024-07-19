import { Inject, Injectable } from '@nestjs/common';
import { ICashHistoryRepository } from './repository/i.cash-history.repository';
import { CashHistory } from './models/cash-history';

/* 생명주기가 다르기 때문에 분리해야한다. */
@Injectable()
export class CashHistoryService {
  constructor(
    @Inject('ICashHistoryRepository')
    private readonly cashHistoryRepository: ICashHistoryRepository,
  ) {}

  async createChargeHistory(args: {
    userId: number;
    amount: number;
  }): Promise<void> {
    const cashHistory = new CashHistory({
      userId: args.userId,
    });

    cashHistory.createChargeHistory({ amount: args.amount });

    await this.cashHistoryRepository.save(cashHistory);
  }

  async createUseHistory(args: {
    userId: number;
    amount: number;
  }): Promise<void> {
    const cashHistory = new CashHistory({
      userId: args.userId,
    });

    cashHistory.createUseHistory({ amount: args.amount });

    await this.cashHistoryRepository.save(cashHistory);
  }
}
