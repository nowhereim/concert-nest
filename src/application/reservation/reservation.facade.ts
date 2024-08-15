import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ConcertService } from 'src/domain/concert/concert.service';
import { RegisterReservationEvent } from 'src/events/reservation/producer/register-reservation.event';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { DataSource } from 'typeorm';
import { TranjactionId } from 'src/events/enum/tranjaction-id.enum';

@Injectable()
export class ReservationFacadeApp {
  constructor(
    private readonly concertService: ConcertService,
    private readonly reservationService: ReservationService,
    private readonly dataSource: DataSource,
    private readonly eventBus: EventBus,
  ) {}

  async registerReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
  }) {
    /* 콘서트 정보 조회 */
    const concert = await this.concertService.findConcertInfoBySeatId({
      seatId: args.seatId,
      concertId: args.concertId,
    });
    const reservation = await this.dataSource
      .createEntityManager()
      .transaction(async (transactionalEntityManager) => {
        /* 좌석 비활성화 */
        await this.concertService.seatReservation(
          {
            seatId: args.seatId,
            concertId: args.concertId,
          },
          transactionalEntityManager,
        );
        /* 예약 생성 */
        const reservation = await this.reservationService.registerReservation(
          {
            userId: args.userId,
            seatId: args.seatId,
            seatNumber: concert.seat.seatNumber,
            concertName: concert.name,
            concertId: concert.id,
            price: concert.seat.price,
            openAt: concert.concertSchedule.openAt,
            closeAt: concert.concertSchedule.closeAt,
          },
          transactionalEntityManager,
        );

        return reservation;
      });

    /* TODO: 비동기 이벤트 발행 예시 ( 추후 이동 및 변경 가능 ) */
    this.eventBus.publish(
      new RegisterReservationEvent(TranjactionId.SUCCESS, reservation),
    );
    return reservation;
  }

  async expireAllExpiredReservations(): Promise<
    {
      seatId: number;
    }[]
  > {
    const expireSeatsInfo = await this.dataSource
      .createEntityManager()
      .transaction(async (transactionalEntityManager) => {
        const expireSeatsInfo =
          await this.reservationService.expireAllExpiredReservations(
            transactionalEntityManager,
          );
        await this.concertService.seatsActivate(
          expireSeatsInfo,
          transactionalEntityManager,
        );
        return expireSeatsInfo;
      });

    return expireSeatsInfo;
  }
}
