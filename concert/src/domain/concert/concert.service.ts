import { Inject, Injectable } from '@nestjs/common';
import { IConcertRepository } from './interface/i.concert.repository';
import { Concert, ConcertInfo } from './models/concert';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../exception/exceptions';
import { Seat } from './models/seat';
import { EventDispatcher } from '../events/event.dispatcher';

@Injectable()
export class ConcertService {
  constructor(
    @Inject('IConcertRepository')
    private readonly concertRepository: IConcertRepository,

    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async findAvailableDate(args: { concertId: number }): Promise<Concert> {
    const concert = await this.concertRepository.findByConcertId(args);

    if (!concert)
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertId: ${args.concertId} not found`,
      });
    concert.findAvailableDate();
    return concert;
  }

  async findAvailableSeat(args: {
    concertScheduleId: number;
  }): Promise<Concert> {
    const concert = await this.concertRepository.findByConcertScheduleId(args);
    if (!concert)
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertScheduleId: ${args.concertScheduleId} not found`,
      });
    concert.findAvailableSeat(args);
    return concert;
  }

  async findConcertInfoBySeatId(args: {
    seatId: number;
    concertId: number;
  }): Promise<ConcertInfo> {
    const concert = await this.concertRepository.findByConcertId({
      concertId: args.concertId,
    });
    if (!concert)
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertId : ${args.concertId} , seatId : ${args.seatId} not found `,
      });
    return concert.getConcertInfoBySeatId({ seatId: args.seatId });
  }

  async seatDeactivate(args: {
    seatId: number;
    concertId: number;
    transactionId: string;
  }): Promise<Concert> {
    let concert: Concert | null = null;
    try {
      concert = await this.concertRepository.findByConcertId({
        concertId: args.concertId,
      });
      if (!concert)
        throw notFound('예약 가능한 콘서트가 없습니다.', {
          cause: `concertId : ${args.concertId} not found`,
        });
      concert.seatDeactivate(args);
      return await this.concertRepository
        .getTransactionManager()
        .transaction(async (transactionalEntityManager) => {
          const updatedConcert =
            await this.concertRepository.updateIsActiveWithOptimisticLock(
              { concert, seatId: args.seatId },
              transactionalEntityManager,
            );

          if (updatedConcert.affected === 0)
            throw badRequest('이미 예약된 좌석 입니다.', {
              cause: `seatId : ${args.seatId} already reserved`,
            });

          // throw new Error('test');
          return await this.concertRepository.save(
            concert,
            transactionalEntityManager,
          );
        });
    } catch (e) {
      await this.eventDispatcher.seatDeactivateFailEvent({
        args,
        transactionId: args.transactionId,
      });
      throw internalServerError('좌석 비활성화에 실패했습니다.', {
        cause: e,
      });
    }
  }

  async seatActivate(args: { seatId: number }): Promise<Seat> {
    const concert = await this.concertRepository.findBySeatId({
      seatId: args.seatId,
    });
    concert.seatActivate(args);
    const [concertSchedule] = concert.concertSchedules;
    const [seat] = concertSchedule.seats;
    return await this.concertRepository
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const updatedConcertSchedule =
          await this.concertRepository.updateReservedSeats(
            { concertSchedule },
            transactionalEntityManager,
          );
        const saveSeat = await this.concertRepository.saveSeat(
          { seat },
          transactionalEntityManager,
        );
        if (updatedConcertSchedule.affected === 0 || !saveSeat)
          throw internalServerError('좌석 활성화에 실패했습니다.', {
            cause: `seatId : ${args.seatId} not activated`,
          });
        return saveSeat;
      });
  }

  async findBySeatId(args: { seatId: number }): Promise<Concert> {
    return await this.concertRepository.findBySeatId(args);
  }

  async seatsActivate(args: { reservation: any[] }): Promise<void> {
    const updatePromises = args.reservation.map(async (reservation) => {
      const concert = await this.concertRepository.findByConcertId({
        concertId: reservation.concertId,
      });
      if (!concert) return;
      concert.seatActivate({ seatId: reservation.seatId });
      await this.concertRepository.save(concert);
    });
    await Promise.all(updatePromises);
  }
}
