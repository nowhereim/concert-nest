import { HttpException } from '@nestjs/common';
import { IsNotEmpty, IsNumber, validate } from 'class-validator';
import { Cash } from 'src/domain/user/models/cash';
import { User } from 'src/domain/user/models/user';

export class UserCashChargeResponseDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  constructor(args: Cash) {
    this.balance = args.getBalance();
  }

  toResponse() {
    return {
      balance: this.balance,
    };
  }
}

export class UserCashUseRepoonseDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  constructor(args: User) {
    this.balance = args.cash.getBalance();
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw new HttpException(error.constraints, 500);
    }

    return {
      balance: this.balance,
    };
  }
}
