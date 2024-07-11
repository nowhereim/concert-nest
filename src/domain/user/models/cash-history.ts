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
