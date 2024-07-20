import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';
import { IssueTokenRequestDto } from './dto/request.dto';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueueAuthGuard } from 'src/presentation/shared/guards/queue-auth.guard';
import {
  IssueTokenResponseDto,
  ReadTokenResponseDto,
} from './dto/response.dto';
import { CustomReqeust } from 'src/presentation/shared/interface/custom.request';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueFacadeApp: QueueFacadeApp) {}

  /* 대기열 토큰 발급 */
  @ApiOperation({ summary: '대기열 토큰 발급' })
  @ApiResponse({
    status: 201,
    description: '발급 성공',
  })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @ApiNotFoundResponse({ description: '없는 사용자' })
  @Post()
  async issueToken(@Body() issueTokenRequestDto: IssueTokenRequestDto) {
    return new IssueTokenResponseDto(
      await this.queueFacadeApp.createQueue(issueTokenRequestDto.toDomain()),
    ).toResponse();
  }

  /* 대기열 토큰 조회 */
  @ApiOperation({ summary: '대기열 토큰 조회' })
  @UseGuards(QueueAuthGuard)
  @ApiHeader({
    name: 'queue-token',
    required: true,
    description: '대기열 토큰',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  @ApiNotFoundResponse({ description: '대기열 없음' })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @Get()
  async checkQueueStatus(@Req() req: CustomReqeust) {
    return new ReadTokenResponseDto(
      await this.queueFacadeApp.findByQueueId({
        queueId: parseInt(req.userInfo.queueId),
      }),
    ).toResponse();
  }
}
