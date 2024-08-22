import { Injectable } from '@nestjs/common';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertService } from 'src/domain/concert/concert.service';
import { Seat } from 'src/domain/concert/models/seat';

@Injectable()
export class ConcertFacadeApp {
  constructor(private readonly concertService: ConcertService) {}

  async findAvailableDate(args: { concertId: number }): Promise<Concert> {
    return await this.concertService.findAvailableDate(args);
  }

  async findAvailableSeats(args: {
    concertScheduleId: number;
  }): Promise<Concert> {
    return await this.concertService.findAvailableSeat(args);
  }

  async findConcertInfoBySeatId(args: { seatId: number; concertId: number }) {
    return await this.concertService.findConcertInfoBySeatId(args);
  }

  async seatDeactivate(args: {
    seatId: number;
    concertId: number;
    transactionId: string;
  }): Promise<Concert> {
    return await this.concertService.seatDeactivate(args);
  }

  async seatActivate(args: { seatId: number }): Promise<Seat> {
    return await this.concertService.seatActivate(args);
  }

  async seatsActivate(args: { reservation: any[] }): Promise<void> {
    await this.concertService.seatsActivate(args);
  }
}
