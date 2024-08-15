import { Inject, Injectable } from '@nestjs/common';
import { IConcertClient } from './concert.client.interface';

@Injectable()
export class ConcertFacadeApp {
  constructor(
    @Inject('IConcertClient')
    private readonly concertClient: IConcertClient,
  ) {}
  async findAvailableDate(args: { concertId: number }) {
    return await this.concertClient.findAvailableDate(args);
  }

  async findAvailableSeats(args: { concertScheduleId: number }) {
    return await this.concertClient.findAvailableSeats(args);
  }
}
