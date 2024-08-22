import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindAvailableDateRequestDto {
  @ApiProperty({
    example: 1,
    description: '콘서트 아이디',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  concertId: number;

  toDomain(): { concertId: number } {
    return { concertId: this.concertId };
  }
}

export class FindAvailableSeatsRequestDto {
  @ApiProperty({
    example: 1,
    description: '콘서트 스케줄 아이디',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  concertScheduleId: number;

  toDomain(): {
    concertScheduleId: number;
  } {
    return { concertScheduleId: this.concertScheduleId };
  }
}

export class FindConcertInfoBySeatIdDto {
  @ApiProperty({
    example: 1,
    description: '콘서트 아이디',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  concertId: number;

  @ApiProperty({
    example: 1,
    description: '좌석 아이디',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  seatId: number;

  toDomain(): { concertId: number; seatId: number } {
    return { concertId: this.concertId, seatId: this.seatId };
  }
}
