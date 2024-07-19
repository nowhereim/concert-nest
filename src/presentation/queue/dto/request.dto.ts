import { ApiProperty } from '@nestjs/swagger';
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
