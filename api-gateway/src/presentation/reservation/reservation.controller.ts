import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RegisterReservationDto } from 'src/presentation/reservation/dto/request.dto';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ActiveQueueAuthGuard } from 'src/presentation/shared/guards/active-auth.guard';
import { GetReservationDto } from './dto/request.dto';

@ApiTags('Reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationFacadeApp: ReservationFacadeApp) {}

  /* 좌석 예약 요청 */
  @ApiOperation({ summary: '좌석 예약 요청' })
  @UseGuards(ActiveQueueAuthGuard)
  @ApiHeader({
    name: 'queue-token',
    required: true,
    description: '대기열 토큰',
  })
  @ApiResponse({
    status: 201,
    description: '예약 성공',
  })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한 없음' })
  @ApiNotFoundResponse({ description: '좌석  없음' })
  @Post()
  async registerReservation(
    @Body() registerReservationDto: RegisterReservationDto,
  ) {
    return await this.reservationFacadeApp.registerReservation(
      registerReservationDto.toDomain(),
    );
  }

  /* 예약 정보 조회 */
  @ApiOperation({ summary: '예약 정보 조회' })
  @ApiHeader({
    name: 'queue-token',
    required: true,
    description: '대기열 토큰',
  })
  @ApiResponse({
    status: 200,
    description: '예약 정보 조회 성공',
  })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한 없음' })
  @ApiNotFoundResponse({ description: '예약 정보 없음' })
  @Get()
  async getReservation(@Query() gtReservationDto: GetReservationDto) {
    return await this.reservationFacadeApp.findByUserIdWithPending(
      gtReservationDto.toDomain(),
    );
  }
}
