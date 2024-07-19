import { Inject, Injectable } from '@nestjs/common';
import { IReservationRepository } from './i.reservation.repository';
import { SeatReservation, SeatReservationStatus } from './seat.reservation';
import { EntityManager } from 'typeorm';
import { notFound } from '../exception/exceptions';

@Injectable()
export class ReservationService {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async registerReservation(
    args: {
      userId: number;
      seatId: number;
      concertId: number;
      seatNumber: number;
      price: number;
      concertName: string;
      openAt: Date;
      closeAt: Date;
    },
    transactionalEntityManager?: EntityManager,
  ): Promise<SeatReservation> {
    const reservation =
      await this.reservationRepository.findAllByUserIdOrSeatId({
        userId: args.userId,
        seatId: args.seatId,
      });

    reservation.forEach((res) =>
      res.verify({ userId: args.userId, seatId: args.seatId }),
    );
    const seatReservation = new SeatReservation({
      ...args,
      status: SeatReservationStatus.PENDING,
    });
    return await this.reservationRepository.save(
      seatReservation,
      transactionalEntityManager,
    );
  }

  async getReservation(args: { userId: number }): Promise<SeatReservation> {
    const seatReservation = await this.reservationRepository.findByUserId({
      userId: args.userId,
    });
    if (!seatReservation)
      throw notFound('예약된 좌석이 없습니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    return seatReservation;
  }

  async completeReservation(
    args: {
      seatId: number;
    },
    transactionalEntityManager?: EntityManager,
  ): Promise<SeatReservation> {
    const seatReservation = await this.reservationRepository.findBySeatId({
      seatId: args.seatId,
    });
    if (!seatReservation)
      throw notFound('예약된 좌석이 없습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    seatReservation.complete();
    return await this.reservationRepository.save(
      seatReservation,
      transactionalEntityManager,
    );
  }

  async expireReservation(args: { seatId: number }): Promise<SeatReservation> {
    const seatReservation = await this.reservationRepository.findBySeatId({
      seatId: args.seatId,
    });
    if (!seatReservation)
      throw notFound('예약된 좌석이 없습니다.', {
        cause: `seatId: ${args.seatId} not found`,
      });
    seatReservation.expire();
    return await this.reservationRepository.save(seatReservation);
  }

  async expireAllExpiredReservations(
    transactionalEntityManager?: EntityManager,
  ): Promise<{ seatId: number; concertId: number }[]> {
    const cutoffTime = new Date(new Date().getTime() - 1000 * 10);
    const expiredReservations =
      await this.reservationRepository.findExpired(cutoffTime);
    if (expiredReservations.length === 0) return [];
    const expireAllExpiredReservationsAndSave =
      await this.reservationRepository.saveAll(
        expiredReservations.map((reservation) => {
          reservation.expire();
          return reservation;
        }),
        transactionalEntityManager,
      );

    return expireAllExpiredReservationsAndSave.map((reservation) => {
      return {
        seatId: reservation.seatId,
        concertId: reservation.concertId,
      };
    });
  }
}
