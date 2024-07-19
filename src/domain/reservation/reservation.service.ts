import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IReservationRepository } from './i.reservation.repository';
import { SeatReservation, SeatReservationStatus } from './seat.reservation';
import { EntityManager } from 'typeorm';

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
      throw new NotFoundException('Seat reservation not found');
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
      throw new NotFoundException('Seat reservation not found');
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
      throw new NotFoundException('Seat reservation not found');
    seatReservation.expire();
    return await this.reservationRepository.save(seatReservation);
  }

  async expireReservations(
    transactionalEntityManager?: EntityManager,
  ): Promise<{ seatId: number }[]> {
    const seatReservations = await this.reservationRepository.findExpired();
    if (seatReservations.length === 0) return [];
    const saveAll = await this.reservationRepository.saveAll(
      seatReservations.map((reservation) => {
        reservation.expire();
        return reservation;
      }),
      transactionalEntityManager,
    );

    return saveAll.map((reservation) => {
      return {
        seatId: reservation.seatId,
      };
    });
  }
}
