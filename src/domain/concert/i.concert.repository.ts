import { EntityManager } from 'typeorm';
import { Concert } from './models/concert';

export interface IConcertRepository {
  save(
    args: Concert,
    transactionalEntityManager?: EntityManager,
  ): Promise<Concert>;
  findByConcertId(args: { concertId: number }): Promise<Concert>;
  findByConcertScheduleId(args: {
    concertScheduleId: number;
  }): Promise<Concert>;
  findBySeatId(args: { seatId: number }): Promise<Concert>;
  findBySeatIdAndConcertId(args: {
    seatId: number;
    concertId: number;
  }): Promise<Concert>;
}
