import { BadRequestException } from '@nestjs/common';

export class Cash {
  protected id?: number;
  protected userId: number;
  protected balance: number;

  constructor(args: { id?: number; userId: number; balance: number }) {
    this.id = args.id;
    this.userId = args.userId;
    this.balance = args.balance;
  }

  charge(amount: number): void {
    if (amount < 0) {
      throw new BadRequestException('잘못된 금액입니다.');
    }
    this.balance += amount;
  }

  use(amount: number): void {
    if (amount < 0) {
      throw new BadRequestException('잘못된 금액입니다.');
    }
    if (this.balance < amount) {
      throw new BadRequestException('잔액이 부족합니다.');
    }
    this.balance -= amount;
  }

  getBalance(): number {
    return this.balance;
  }

  getId(): number {
    return this.id;
  }
}
