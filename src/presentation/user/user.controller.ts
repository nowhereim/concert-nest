import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserFacadeApp } from 'src/application/user/user.facade';
import { UserCashChargeDto, UserCashReaadDto } from './dto/request.dto';
import {
  UserCashChargeResponseDto,
  UserCashUseRepoonseDto,
} from './dto/response.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userFacadeApp: UserFacadeApp) {}

  /* 유저 포인트 충전 */ // 로그인 기능은 생략
  @ApiOperation({ summary: '유저 포인트 충전' })
  @ApiResponse({
    status: 201,
    description: '충전 성공',
  })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @ApiNotFoundResponse({ description: '사용자 없음' })
  @Post('cash')
  async chargePoint(@Body() userCashChargeDto: UserCashChargeDto) {
    return new UserCashChargeResponseDto(
      await this.userFacadeApp.cashCharge(await userCashChargeDto.toDmain()),
    ).toResponse();
  }

  /* 유저 포인트 조회 */ // 로그인 기능은 생략
  @ApiOperation({ summary: '유저 포인트 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  @ApiNotFoundResponse({ description: '사용자 없음' })
  @Get('cash')
  async checkPoint(@Query() userCashReaadDto: UserCashReaadDto) {
    return new UserCashUseRepoonseDto(
      await this.userFacadeApp.cashRead(userCashReaadDto.toDmain()),
    ).toResponse();
  }
}
