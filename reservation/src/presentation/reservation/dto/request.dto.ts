import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterReservationDto {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: 1,
    description: '좌석 아이디',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  seatId: number;

  @ApiProperty({
    example: 1,
    description: '콘서트 아이디',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  concertId: number;

  toDomain() {
    return {
      userId: this.userId,
      seatId: this.seatId,
      concertId: this.concertId,
    };
  }
}

export class GetReservationDto {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  toDomain() {
    return {
      userId: this.userId,
    };
  }
}
