import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  IssueTokenRequestDto,
  ReadTokenRequestDto,
} from 'src/presentation/queue/dto/request.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';

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
    return await this.queueFacadeApp.registerQueue(
      issueTokenRequestDto.toDomain(),
    );
  }

  /* 대기열 토큰 조회 */
  @ApiOperation({ summary: '대기열 토큰 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  @ApiNotFoundResponse({ description: '대기열 없음' })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @Get()
  async checkQueueStatus(@Query() readTokenRequestDto: ReadTokenRequestDto) {
    return await this.queueFacadeApp.validToken({
      queueId: readTokenRequestDto.toDomain(),
    });
  }
}
