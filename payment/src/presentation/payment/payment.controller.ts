import { Body, Controller, Post } from '@nestjs/common';
import { PaymentPayReqeustDto } from './dto/request.dto';
import { PaymentFacadeApp } from 'src/application/payment/payment.facade';
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
import { PaymentPayResponseDto } from './dto/response.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentFacadeApp: PaymentFacadeApp) {}
  /* 결제 요청 */
  @ApiOperation({ summary: '결제 요청' })
  @ApiHeader({
    name: 'queue-token',
    required: true,
    description: '대기열 토큰',
  })
  @ApiResponse({
    status: 201,
    description: '결제 성공',
  })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한 없음' })
  @ApiNotFoundResponse({ description: '좌석 점유 없음' })
  @Post()
  async pay(
    @Body()
    paymentPayReqeustDto: PaymentPayReqeustDto,
  ) {
    return new PaymentPayResponseDto(
      await this.paymentFacadeApp.pay(paymentPayReqeustDto.toDomain()),
    ).toResponse();
  }
}
