import { Controller, Get, Query } from '@nestjs/common';

@Controller('concert')
export class ConcertController {
  constructor() {}

  /* 예약 가능 날짜 조회 */
  @Get('available-dates')
  async getAvailableDates() {
    return {
      success: true,
      data: [
        {
          id: 1,
          totalSeats: 50,
          reservedSeats: 38,
          open_at: '2024-01-01T00:00:00',
          close_at: '2024-01-01T00:00:00',
        },
        {
          id: 2,
          totalSeats: 50,
          reservedSeats: 48,
          open_at: '2024-01-03T00:00:00',
          close_at: '2024-01-03T00:00:00',
        },
      ],
    };
  }

  /* 예약 가능 좌석 조회 */
  @Get('available-seats')
  async getAvailableSeats(@Query() dto: { concertScheduleId: number }) {
    console.log(dto);
    return {
      success: true,
      data: [
        {
          id: 1,
          seatNumber: '1',
          price: 1000,
        },
        {
          id: 2,
          seatNumber: '50',
          price: 5000,
        },
      ],
    };
  }
}
