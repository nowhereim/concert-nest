import { HttpException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  validate,
} from 'class-validator';
import { validationError } from 'src/domain/exception/exceptions';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertSchedule } from 'src/domain/concert/models/concert-schedule';
import { Seat } from 'src/domain/concert/models/seat';

export class FindAvailableDateResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConcertScheduleDto)
  schedules: ConcertScheduleDto[];

  constructor(args: Concert) {
    this.schedules = args.concertSchedules.map(
      (schedule) => new ConcertScheduleDto(schedule),
    );
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw validationError('ResponseValidationError', {
        cause: error,
      });
    }
    return this.schedules.map((el) => {
      return {
        id: el.id,
        totalSeats: el.totalSeats,
        reservedSeats: el.reservedSeats,
        openAt: el.openAt,
        closeAt: el.closeAt,
        bookingStartAt: el.bookingStartAt,
        bookingEndAt: el.bookingEndAt,
      };
    });
  }
}

export class FindAvailableSeatsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];

  constructor(args: Concert) {
    this.seats = args.concertSchedules
      .map((schedule) => {
        return schedule.seats.map((seat) => new SeatDto(seat));
      })
      .flat();
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw new HttpException(error.constraints, 500);
    }
    return this.seats.map((el) => {
      return {
        id: el.id,
        isActive: el.isActive,
        seatNumber: el.seatNumber,
        price: el.price,
      };
    });
  }
}

export class ConcertScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  totalSeats: number;

  @IsNumber()
  @IsNotEmpty()
  reservedSeats: number;

  @IsDate()
  @IsNotEmpty()
  openAt: Date;

  @IsDate()
  @IsNotEmpty()
  closeAt: Date;

  @IsDate()
  @IsNotEmpty()
  bookingStartAt: Date;

  @IsDate()
  @IsNotEmpty()
  bookingEndAt: Date;

  constructor(args: ConcertSchedule) {
    this.id = Number(args.id);
    this.totalSeats = args.totalSeats;
    this.reservedSeats = args.reservedSeats;
    this.openAt = args.openAt;
    this.closeAt = args.closeAt;
    this.bookingStartAt = args.bookingStartAt;
    this.bookingEndAt = args.bookingEndAt;
  }
}

export class SeatDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsNumber()
  @IsNotEmpty()
  seatNumber: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  constructor(args: Seat) {
    this.id = Number(args.id);
    this.isActive = args.isActive;
    this.seatNumber = args.seatNumber;
    this.price = args.price;
  }
}
