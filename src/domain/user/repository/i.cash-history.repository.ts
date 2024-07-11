import { CashHistory } from '../models/cash-history';

export interface ICashHistoryRepository {
  save(args: CashHistory): Promise<CashHistory>;
}
