import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IConcertRepository } from './i.concert.repository';
import { Concert, ConcertInfo } from './models/concert';
import { EntityManager } from 'typeorm';

@Injectable()
export class ConcertService {
  constructor(
    @Inject('IConcertRepository')
    private readonly concertRepository: IConcertRepository,
  ) {}

  async findAvailableDate(args: { concertId: number }): Promise<Concert> {
    const concert = await this.concertRepository.findByConcertId(args);

    if (!concert) throw new NotFoundException('예약 가능한 콘서트가 없습니다.');
    concert.findAvailableDate();
    return concert;
  }

  async findAvailableSeat(args: {
    concertScheduleId: number;
  }): Promise<Concert> {
    const concert = await this.concertRepository.findByConcertScheduleId(args);
    if (!concert) throw new NotFoundException('예약 가능한 콘서트가 없습니다.');
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
    if (!concert) throw new NotFoundException('예약 가능한 콘서트가 없습니다.');
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
    if (!concert) throw new NotFoundException('예약 가능한 콘서트가 없습니다.');
    concert.seatDeactivate(args);
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
    if (!concert) throw new NotFoundException('예약 가능한 콘서트가 없습니다.');
    concert.seatActivate(args);
    return await this.concertRepository.save(concert);
  }

  async seatsActivate(
    args: {
      seatId: number;
    }[],
    transactionalEntityManager?: EntityManager,
  ): Promise<void> {
    args.forEach(async ({ seatId }) => {
      const rootConcert = await this.concertRepository.findBySeatId({
        seatId,
      });
      const concert = await this.concertRepository.findByConcertId({
        concertId: rootConcert.id,
      });

      concert.seatActivate({ seatId });
      await this.concertRepository.save(concert, transactionalEntityManager);
    });
  }
}
