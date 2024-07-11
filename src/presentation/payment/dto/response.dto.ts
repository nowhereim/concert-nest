import { HttpException } from '@nestjs/common';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validate,
} from 'class-validator';
import { Payment, PaymentStatus } from 'src/domain/payment/payment';

export class PaymentPayResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  seatNumber: number;

  @IsNotEmpty()
  @IsString()
  concertName: string;

  @IsDate()
  @IsNotEmpty()
  openAt: Date;

  @IsDate()
  @IsNotEmpty()
  closeAt: Date;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  constructor(args: Payment) {
    Object.assign(this, args);
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw new HttpException(error.constraints, 500);
    }

    return {
      id: this.id,
      seatNumber: this.seatNumber,
      concertName: this.concertName,
      openAt: this.openAt,
      closeAt: this.closeAt,
      status: this.status,
      totalAmount: this.totalAmount,
    };
  }
}
