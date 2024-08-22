import { badRequest } from 'src/domain/exception/exceptions';

export class Cash {
  id?: number;
  userId: number;
  balance: number;
  version: number;

  constructor(args: {
    id?: number;
    userId?: number;
    balance: number;
    version?: number;
  }) {
    this.id = args.id;
    this.userId = args.userId;
    this.balance = args.balance;
    this.version = args.version;
  }

  charge(amount: number): void {
    if (amount < 0) {
      throw badRequest('잘못된 금액입니다.', {
        cause: `amount: ${amount} is invalid`,
      });
    }
    this.balance += amount;
  }

  use(amount: number): void {
    if (amount < 0) {
      throw badRequest('잘못된 금액입니다.', {
        cause: `amount: ${amount} is invalid`,
      });
    }
    if (this.balance < amount) {
      throw badRequest('잔액이 부족합니다.', {
        cause: `amount: ${amount} balance: ${this.balance} is not enough`,
      });
    }
    this.balance -= amount;
  }

  getBalance(): number {
    return this.balance;
  }

  getId(): number {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }
}
