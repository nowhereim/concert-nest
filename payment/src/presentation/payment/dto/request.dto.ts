import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PaymentPayReqeustDto {
  @ApiProperty({
    example: 1,
    description: '사용자 아이디',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 1,
    description: '좌석 번호',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  seatId: number;

  toDomain() {
    return {
      userId: this.userId,
      seatId: this.seatId,
    };
  }
}
