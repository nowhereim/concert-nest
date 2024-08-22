import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class ReadTokenRequestDtoV2 {
  @ApiProperty({
    example: 1,
    description: '대기열 아이디',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  queueId: string;

  @ApiProperty({
    example: 1,
    description: '고유 대기번호',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  waitingPosition: string;

  toDomain() {
    return {
      queueId: this.queueId,
      waitingPosition: this.waitingPosition,
    };
  }
}
