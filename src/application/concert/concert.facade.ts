import { Injectable } from '@nestjs/common';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertService } from 'src/domain/concert/concert.service';

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
}
