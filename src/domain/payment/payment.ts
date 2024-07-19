export class Payment {
  id: number;
  userId: number;
  seatNumber: number;
  concertName: string;
  openAt: Date;
  closeAt: Date;
  totalAmount: number;
  status: PaymentStatus;

  constructor(args: {
    id?: number;
    userId: number;
    seatNumber: number;
    concertName: string;
    openAt: Date;
    closeAt: Date;
    totalAmount: number;
    status: PaymentStatus;
  }) {
    Object.assign(this, args);
  }

  complete(): void {
    this.status = PaymentStatus.COMPLETED;
  }

  fail(): void {
    this.status = PaymentStatus.FAILED;
  }

  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  releaseEvent(): void {
    // release event
  }
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
