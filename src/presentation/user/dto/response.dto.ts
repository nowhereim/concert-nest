import { HttpException } from '@nestjs/common';
import { IsNotEmpty, IsNumber, validate } from 'class-validator';
import { User } from 'src/domain/user/models/user';

export class UserCashChargeResponseDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  constructor(args: User) {
    this.balance = args.cash.getBalance();
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
