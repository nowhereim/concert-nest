import { Body, Controller, Post } from '@nestjs/common';

@Controller('reservation')
export class ReservationController {
  constructor() {}

  /* 좌석 예약 요청 */
  /* 실 개발시 라우터 진입 전 가드에서 header의 대기열 토큰으로 체크. */
  @Post()
  async reserveSeat(@Body() dto: { seatId: number }) {
    console.log(dto);
    return {
      success: true,
      data: {
        id: 1,
        seat: {
          id: 1,
          isActive: false,
          seatNumber: 1,
        },
        status: 'PENDING',
        created_at: '2024-01-01T00:00:00',
      },
    };
  }
}
