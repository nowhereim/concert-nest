import { badRequest } from 'src/domain/exception/exceptions';

export class Seat {
  id: number;
  seatNumber: number;
  isActive: boolean;
  price: number;
  version: number;

  constructor(args: {
    id?: number;
    seatNumber: number;
    isActive: boolean;
    price: number;
    version?: number;
  }) {
    Object.assign(this, args);
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) {
      throw badRequest('이미 비활성화된 좌석입니다.', {
        cause: `seatId: ${this.id} already deactivated`,
      });
    }
    this.isActive = false;
  }
}
