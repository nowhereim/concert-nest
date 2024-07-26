import { Inject, Injectable } from '@nestjs/common';
import { IConcertRepository } from './i.concert.repository';
import { Concert, ConcertInfo } from './models/concert';
import { EntityManager } from 'typeorm';
import { badRequest, notFound } from '../exception/exceptions';
import { ISeatRepository } from './i.seat.repository';

@Injectable()
export class ConcertService {
  constructor(
    @Inject('IConcertRepository')
    private readonly concertRepository: IConcertRepository,
    @Inject('ISeatRepository')
    private readonly seatRepository: ISeatRepository,
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

  async seatReservation(
    args: {
      seatId: number;
      concertId: number;
    },
    transactionalEntityManager?: EntityManager,
  ): Promise<Concert> {
    const concert = await this.concertRepository.findByConcertId({
      concertId: args.concertId,
    });
    if (!concert)
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertId : ${args.concertId} not found`,
      });
    concert.seatDeactivate(args);
    const updatedConcert =
      await this.seatRepository.updateIsActiveWithOptimisticLock(
        { concert, seatId: args.seatId },
        transactionalEntityManager,
      );

    if (updatedConcert.affected === 0)
      throw badRequest('이미 예약된 좌석 입니다.', {
        cause: `seatId : ${args.seatId} already reserved`,
      });

    return await this.concertRepository.save(
      concert,
      transactionalEntityManager,
    );
  }

  async seatActivate(args: {
    seatId: number;
    concertId: number;
  }): Promise<Concert> {
    const concert = await this.concertRepository.findByConcertId({
      concertId: args.concertId,
    });
    if (!concert)
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertId : ${args.concertId} not found`,
      });
    concert.seatActivate(args);
    return await this.concertRepository.save(concert);
  }

  async seatsActivate(
    args: { seatId: number; concertId: number }[],
    transactionalEntityManager?: EntityManager,
  ): Promise<void> {
    const updatePromises = args.map(async ({ seatId, concertId }) => {
      const concert = await this.concertRepository.findByConcertId({
        concertId,
      });
      if (!concert) return;
      concert.seatActivate({ seatId });
      await this.concertRepository.save(concert, transactionalEntityManager);
    });

    await Promise.all(updatePromises);
  }
}
