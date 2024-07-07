import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserFacadeApp } from 'src/application/user/user.facade(App)';

@Controller('user')
export class UserController {
  constructor(private readonly userFacadeApp: UserFacadeApp) {}

  @Post('register')
  async registerUser(@Body() args: { name: string }) {
    return await this.userFacadeApp.register(args);
  }
  /* 유저 포인트 충전 */
  @Post('charge')
  async chargePoint(@Body() dto: { amount: number; userId: string }) {
    return await this.userFacadeApp.cashCharge({
      userId: parseInt(dto.userId),
      amount: dto.amount,
    });
  }

  /* 유저 포인트 조회 */
  @Get('check')
  async checkPoint(@Query() args: { userId: string }) {
    console.log(args);
    return { success: true, data: { balance: 1000 } };
  }
}
