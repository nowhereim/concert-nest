export class Queue {
  id: number;
  userId: number;
  status: QueueStatusEnum;
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
}

export enum QueueStatusEnum {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}
