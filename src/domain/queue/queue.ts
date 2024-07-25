import { forbidden, unauthorized } from '../exception/exceptions';

export class Queue {
  id: number;
  userId: number;
  status: QueueStatusEnum;
  sequenceNumber: number;
  createdAt: Date;
  expiredAt: Date;
  deletedAt: Date;

  constructor(args: {
    id?: number;
    userId: number;
    status: QueueStatusEnum;
    createdAt?: Date;
    expiredAt?: Date;
    deletedAt?: Date;
  }) {
    Object.assign(this, args);
  }

  inProgress(): void {
    // 지금으로부터 5분 뒤에 만료되도록 설정
    this.expiredAt = new Date(Date.now() + 5 * 60 * 1000);
    this.status = QueueStatusEnum.IN_PROGRESS;
  }

  complete(): void {
    this.deletedAt = new Date();
    this.status = QueueStatusEnum.COMPLETED;
  }

  expire(): void {
    this.deletedAt = new Date();
    this.status = QueueStatusEnum.EXPIRED;
  }

  setSequenceNumber(args: Queue): void {
    const sequenceNumber = this.id - args.id;
    this.sequenceNumber = sequenceNumber;
  }

  verify(needActive: boolean): void {
    if (this.status === QueueStatusEnum.EXPIRED)
      throw unauthorized('만료된 토큰 입니다.', {
        cause: `QueueId: ${this.id} expired`,
      });

    if (this.status !== QueueStatusEnum.IN_PROGRESS && needActive)
      throw forbidden('권한이 없습니다.', {
        cause: `QueueId: ${this.id} not active`,
      });
  }
}

export enum QueueStatusEnum {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}
