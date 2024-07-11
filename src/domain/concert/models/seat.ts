import { BadRequestException } from '@nestjs/common';

export class Seat {
  id: number;
  seatNumber: number;
  isActive: boolean;
  price: number;

  constructor(args: {
    id?: number;
    seatNumber: number;
    isActive: boolean;
    price: number;
  }) {
    Object.assign(this, args);
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new BadRequestException('이미 비활성화된 좌석입니다.');
    }
    this.isActive = false;
  }
}
