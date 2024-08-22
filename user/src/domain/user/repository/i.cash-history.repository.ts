import { CashHistory } from 'src/domain/user/models/cash-history';

export interface ICashHistoryRepository {
  save(args: CashHistory): Promise<CashHistory>;
}
