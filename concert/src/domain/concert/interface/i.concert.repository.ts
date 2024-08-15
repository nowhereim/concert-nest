import { EntityManager, UpdateResult } from 'typeorm';
import { Concert } from '../models/concert';
import { Seat } from '../models/seat';
import { ConcertSchedule } from '../models/concert-schedule';

export interface IConcertRepository {
  save(
    args: Concert,
    transactionalEntityManager?: EntityManager,
  ): Promise<Concert>;

  findByConcertId(args: { concertId: number }): Promise<Concert>;

  findByConcertScheduleId(args: {
    concertScheduleId: number;
  }): Promise<Concert>;

  findBySeatIdAndConcertId(args: {
    seatId: number;
    concertId: number;
  }): Promise<Concert>;

  getTransactionManager(): EntityManager;

  updateIsActiveWithOptimisticLock(
    args: { concert: Concert; seatId: number },
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult>;

  findBySeatIdFromSeat(args: { seatId: number }): Promise<Seat>;

  saveSeat(
    args: { seat: Seat },
    transactionalEntityManager?: EntityManager,
  ): Promise<Seat>;

  findBySeatId(args: { seatId: number }): Promise<Concert>;

  updateReservedSeats(
    args: { concertSchedule: ConcertSchedule },
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult>;
}
