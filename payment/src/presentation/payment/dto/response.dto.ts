import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validate,
} from 'class-validator';
import { validationError } from 'src/domain/exception/exceptions';
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

  @IsDateString()
  @IsNotEmpty()
  openAt: Date;

  @IsDateString()
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
      throw validationError('ResponseValidationError', {
        cause: error,
      });
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
