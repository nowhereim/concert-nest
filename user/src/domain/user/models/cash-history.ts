import { badRequest } from 'src/domain/exception/exceptions';

export class CashHistory {
  id?: number;
  userId: number;
  amount: number;
  type: CashHistoryType;

  constructor(args: {
    id?: number;
    type?: CashHistoryType;
    amount?: number;
    userId: number;
  }) {
    if (args.amount <= 0) {
      throw badRequest('금액은 0보다 커야합니다.', {
        cause: `userId: ${this.userId} , amount: ${args.amount} is invalid`,
      });
    }
    Object.assign(this, args);
  }

  createChargeHistory(args: { amount: number }): void {
    this.amount = args.amount;
    this.type = CashHistoryType.CHARGE;
  }

  createUseHistory(args: { amount: number }): void {
    this.amount = args.amount;
    this.type = CashHistoryType.USE;
  }
}

export enum CashHistoryType {
  CHARGE = 'CHARGE',
  USE = 'USE',
}
