export class Queue {
  id: number;
  status: QueueStatusEnum;
  waitingPosition: number;

  constructor(args: {
    id: number;
    status: QueueStatusEnum;
    waitingPosition?: number;
  }) {
    Object.assign(this, args);
  }

  inProgress(): void {
    this.status = QueueStatusEnum.IN_PROGRESS;
  }

  setwaitingPosition(position: number): void {
    this.waitingPosition = position;
  }
}

export enum QueueStatusEnum {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
}
