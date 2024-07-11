import { Cash } from './cash';

export class User {
  readonly id: number;
  readonly name: string;
  readonly cash: Cash;

  constructor(args: { id?: number; name: string; cash?: Cash }) {
    this.id = args.id;
    this.name = args.name;
    this.cash = args.cash;
  }

  cashCharge(amount: number): void {
    this.cash.charge(amount);
  }

  cashUse(amount: number): void {
    this.cash.use(amount);
  }
}
