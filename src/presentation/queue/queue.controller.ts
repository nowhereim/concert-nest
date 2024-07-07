import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('queue')
export class QueueController {
  constructor() {}

  /* 대기열 토큰 발급 */
  @Post('issue')
  async issueToken(@Body() dto: { userId: string }) {
    console.log(dto);
    return { success: true, data: { token: 'queue-uuid', status: 'pending' } };
  }

  /* 대기열 토큰 조회 */
  /* 실 개발시 라우터 진입 전 가드에서 header의 대기열 토큰으로 체크. */
  @Get('check')
  async checkQueueStatus(@Req() req: Request) {
    console.log(req.headers['queue-token']);
    return {
      success: true,
      data: {
        position: 9239824,
        status: 'PENDING',
        estimatedTime: '299m',
      },
    };
  }
}
