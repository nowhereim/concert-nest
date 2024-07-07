import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  /* 결제 요청 */
  /* 다른 도메인끼리 비동기 처리시 즉시 반환 시점에 확정 상태가 될 수 없음. */
  @Post()
  async pay(
    @Req() req: Request,
    @Body()
    dto: {
      seatId: number;
    },
  ) {
    console.log(dto);
    return {
      success: true,
      data: {
        seatNumber: 1,
        concertName: 1,
        openDate: '2024-01-01T00:00:00',
        closeDate: '2024-01-01T00:00:00',
        totalAmount: 1000,
        statue: 'PENDING',
      },
    };
  }
}
