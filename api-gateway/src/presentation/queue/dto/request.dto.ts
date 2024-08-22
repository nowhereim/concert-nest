import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class IssueTokenRequestDto {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  toDomain() {
    return {
      userId: this.userId,
    };
  }
}

export class ReadTokenRequestDto {
  @ApiProperty({
    example: 1,
    description: '대기열 아이디',
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  queueId: number;

  toDomain() {
    return this.queueId;
  }
}
