import { HttpException } from '@nestjs/common';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validate,
} from 'class-validator';
import {
  SeatReservation,
  SeatReservationStatus,
} from 'src/domain/reservation/seat.reservation';

export class RegisterReservationResponseDto {
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsEnum(SeatReservationStatus)
  status: SeatReservationStatus;

  @IsNotEmpty()
  @IsString()
  concertName: string;

  @IsNumber()
  @IsNotEmpty()
  seatNumber: number;

  @IsNotEmpty()
  @IsDateString()
  openAt: Date;

  @IsNotEmpty()
  @IsDateString()
  closeAt: Date;

  constructor(args: SeatReservation) {
    this.price = args.price;
    this.status = args.status;
    this.concertName = args.concertName;
    this.seatNumber = args.seatNumber;
    this.openAt = args.openAt;
    this.closeAt = args.closeAt;
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw new HttpException(error.constraints, 500);
    }

    return {
      price: this.price,
      status: this.status,
      concertName: this.concertName,
      seatNumber: this.seatNumber,
      openAt: this.openAt,
      closeAt: this.closeAt,
    };
  }
}
