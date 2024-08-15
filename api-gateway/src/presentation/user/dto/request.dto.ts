import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, validate } from 'class-validator';

export class UserCashReaadDto {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  toDmain() {
    return {
      userId: this.userId,
    };
  }
}

export class UserCashChargeDto {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 1000,
    description: '충전할 포인트',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  async toDmain() {
    const [error] = await validate(this);
    if (error) {
      throw error;
    }
    return {
      userId: this.userId,
      amount: this.amount,
    };
  }
}
