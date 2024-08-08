import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  IssueTokenRequestDto,
  ReadTokenRequestDto,
  ReadTokenRequestDtoV2,
} from './dto/request.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IssueTokenResponseDto,
  IssueTokenResponseDtoV2,
  ReadTokenResponseDto,
  ReadTokenResponseDtoV2,
} from './dto/response.dto';
import { RegisterQueueUseCase } from 'src/application/queue/usecase/register-queue.use-case';
import { ValidTokenUseCase } from 'src/application/queue/usecase/valid-token.use-case';
import * as RegisterQueueUseCaseV2 from 'src/application/queue/usecase-v2/register-queue.use-case';
import * as ValidTokenUseCaseV2 from 'src/application/queue/usecase-v2/valid-token.use-case';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(
    private readonly registerQueueUseCase: RegisterQueueUseCase,
    private readonly validTokenUseCase: ValidTokenUseCase,
    private readonly registerQueueUseCaseV2: RegisterQueueUseCaseV2.RegisterQueueUseCase,
    private readonly validTokenUseCaseV2: ValidTokenUseCaseV2.ValidTokenUseCase,
  ) {}

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
      await this.registerQueueUseCase.execute(issueTokenRequestDto.toDomain()),
    ).toResponse();
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
  async checkQueueStatus(@Query() queueId: ReadTokenRequestDto) {
    return new ReadTokenResponseDto(
      await this.validTokenUseCase.execute({
        queueId: queueId.toDomain(),
      }),
    ).toResponse();
  }

  /* 대기열 토큰 발급 V2 */
  @ApiOperation({ summary: '대기열 토큰 발급' })
  @ApiResponse({
    status: 201,
    description: '발급 성공',
  })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @ApiNotFoundResponse({ description: '없는 사용자' })
  @Post('v2')
  async issueTokenV2() {
    return new IssueTokenResponseDtoV2(
      await this.registerQueueUseCaseV2.execute(),
    ).toResponse();
  }

  /* 대기열 토큰 조회 V2 */
  @ApiOperation({ summary: '대기열 토큰 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  @ApiNotFoundResponse({ description: '대기열 없음' })
  @ApiBadRequestResponse({ description: '잘못된 요청' })
  @Get('v2')
  async checkQueueStatusV2(@Query() query: ReadTokenRequestDtoV2) {
    return new ReadTokenResponseDtoV2(
      await this.validTokenUseCaseV2.execute(query.toDomain()),
    ).toResponse();
  }
}
