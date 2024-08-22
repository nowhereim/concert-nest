import { HttpException, Inject, Injectable } from '@nestjs/common';
import { IConcertClient } from './concert.client.interface';

@Injectable()
export class ConcertFacadeApp {
  constructor(
    @Inject('IConcertClient')
    private readonly concertClient: IConcertClient,
  ) {}
  async findAvailableDate(args: { concertId: number }) {
    try {
      return await this.concertClient.findAvailableDate(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }

  async findAvailableSeats(args: { concertScheduleId: number }) {
    try {
      return await this.concertClient.findAvailableSeats(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
