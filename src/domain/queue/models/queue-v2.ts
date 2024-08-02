export class QueueV2 {
  id: string;
  waitingPosition: number;
  waitingTime: string | null;
  status: QueueV2StatusEnum;

  constructor(args: {
    id: string;
    waitingPosition: string;
    status?: QueueV2StatusEnum;
  }) {
    this.id = args.id;
    if (args.waitingPosition)
      this.waitingPosition = parseInt(args.waitingPosition);

    this.status = args.status || QueueV2StatusEnum.WAITING;
  }

  calculateWaitingPositionAndTime(args: { lastOffset: number }): void {
    const remainingPeople = this.waitingPosition - args.lastOffset - 1;
    const processingRatePerMinute = 20000;
    const waitingTimeMinutes = remainingPeople / processingRatePerMinute;
    const minutes = Math.floor(waitingTimeMinutes);
    const seconds = Math.floor((waitingTimeMinutes - minutes) * 60);

    this.waitingTime = `${minutes}분 ${seconds}초`;
    this.waitingPosition = remainingPeople;
  }

  setInProgress(): void {
    this.status = QueueV2StatusEnum.IN_PROGRESS;
  }
}

enum QueueV2StatusEnum {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
}
