import { Inject, Injectable } from '@nestjs/common';
import { IReservationRepository } from './interface/i.reservation.repository';
import { SeatReservation, SeatReservationStatus } from './seat.reservation';
import { EntityManager } from 'typeorm';
import { internalServerError, notFound } from '../exception/exceptions';
import { EventDispatcher, EventType } from '../events/event.dispatcher';
import { IReservationOutboxReader } from '../events/interface/reservation-outbox-writer.interface';

@Injectable()
export class ReservationService {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,

    @Inject('IReservationOutboxReader')
    private readonly reservationOutboxReader: IReservationOutboxReader,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async registerReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
    seatNumber: number;
    price: number;
    concertName: string;
    openAt: Date;
    closeAt: Date;
  }): Promise<SeatReservation> {
    const getReservations =
      await this.reservationRepository.findAllByUserIdOrSeatId({
        userId: args.userId,
        seatId: args.seatId,
      });

    getReservations.forEach((res) =>
      res.verify({ userId: args.userId, seatId: args.seatId }),
    );

    const seatReservation = new SeatReservation({
      ...args,
      status: SeatReservationStatus.PENDING,
    });

    return await this.reservationRepository
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const reservation = await this.reservationRepository.save(
          seatReservation,
          transactionalEntityManager,
        );
        await this.eventDispatcher.registerReservationEvent({
          targetAfter: reservation,
          args,
          transactionalEntityManager,
        });

        return reservation;
      });
  }

  async findByUserIdWithPending(args: {
    userId: number;
  }): Promise<SeatReservation> {
    const seatReservation =
      await this.reservationRepository.findByUserIdWithPending({
        userId: args.userId,
      });
    if (!seatReservation)
      throw notFound('예약된 좌석이 없습니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    return seatReservation;
  }

  async findById(args: { id: number }): Promise<SeatReservation> {
    const seatReservation = await this.reservationRepository.findById({
      id: args.id,
    });
    if (!seatReservation)
      throw notFound('예약된 좌석이 없습니다.', {
        cause: `id: ${args.id} not found`,
      });
    return seatReservation;
  }

  async completeReservation(args: {
    userId: number;
    transactionId: string;
  }): Promise<SeatReservation> {
    try {
      const seatReservation =
        await this.reservationRepository.findByUserIdWithPending({
          userId: args.userId,
        });
      if (!seatReservation)
        throw notFound('예약된 좌석이 없습니다.', {
          cause: `seatId: ${args.userId} not found`,
        });
      seatReservation.complete();
      return await this.reservationRepository
        .getTransactionManager()
        .transaction(async (transactionalEntityManager) => {
          const savedReservation = await this.reservationRepository.save(
            seatReservation,
            transactionalEntityManager,
          );
          await this.eventDispatcher.completeReservationEvent({
            targetBefore: seatReservation,
            targetAfter: savedReservation,
            args,
            transactionId: args.transactionId,
            transactionalEntityManager,
          });

          return savedReservation;
        });
    } catch (e) {
      // await this.eventDispatcher.completeReservationFailEvent({
      //   args,
      //   transactionId: args.transactionId,
      // });
      throw internalServerError(e, {
        cause: `userId: ${args.userId} complete reservation failed`,
      });
    }
  }

  async failReservation(args: {
    transactionId: string;
  }): Promise<SeatReservation> {
    const outbox = await this.reservationOutboxReader.findByTransactionId({
      transactionId: args.transactionId,
      eventType: EventType.RESERVATION_COMPLETED,
    });
    const reservation = await this.reservationRepository.findBySeatId({
      seatId: outbox.event.after.seatNumber,
    });
    if (!reservation)
      throw notFound('해당 예약내역을 찾지 못했습니다.', {
        cause: `seatId: ${outbox.event.after.seatNumber} not found`,
      });

    reservation.fail();
    return await this.reservationRepository.save(reservation);
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

  async expireAllExpiredReservations(): Promise<void> {
    const cutoffTime = new Date(new Date().getTime() - 1000 * 10);

    const expiredReservations =
      await this.reservationRepository.findExpired(cutoffTime);

    await this.reservationRepository
      .getTransactionManager()
      .transaction(async (transactionalEntityManager: EntityManager) => {
        if (expiredReservations.length === 0) return;

        const expireAllExpiredReservationsAndSave =
          await this.reservationRepository.saveAll(
            expiredReservations.map((reservation) => {
              reservation.expire();
              return reservation;
            }),
            transactionalEntityManager,
          );

        await this.eventDispatcher.expiredReservationsEvent({
          targetBefore: expiredReservations,
          targetAfter: expireAllExpiredReservationsAndSave,
          transactionalEntityManager,
        });
      });
    // const result = expireAllExpiredReservationsAndSave.map((reservation) => {
    //   return {
    //     seatId: reservation.seatId,
    //     concertId: reservation.concertId,
    //   };
    // });
  }
}
