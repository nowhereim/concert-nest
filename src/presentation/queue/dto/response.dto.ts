import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  validate,
} from 'class-validator';
import { validationError } from 'src/domain/exception/exceptions';
import { Queue, QueueStatusEnum } from 'src/domain/queue/queue';

export class IssueTokenResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(QueueStatusEnum)
  @IsNotEmpty()
  status: QueueStatusEnum;

  constructor(args: Queue) {
    Object.assign(this, args);
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw validationError('ResponseValidationError', {
        cause: error,
      });
    }
    return {
      id: this.id,
      status: this.status,
    };
  }
}
export class ReadTokenResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(QueueStatusEnum)
  @IsNotEmpty()
  status: QueueStatusEnum;

  @IsOptional()
  @IsNumber()
  sequenceNumber: number = 0;

  constructor(args: Queue) {
    Object.assign(this, args);
  }

  async toResponse() {
    const [error] = await validate(this);
    if (error) {
      throw validationError('ResponseValidationError', {
        cause: error,
      });
    }
    return {
      id: this.id,
      status: this.status,
      sequenceNumber: this.sequenceNumber,
    };
  }
}
