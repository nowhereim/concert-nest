import { Injectable } from '@nestjs/common';
import { ConcertService } from 'src/domain/concert/concert.service';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { DataSource } from 'typeorm';

@Injectable()
export class ReservationFacadeApp {
  constructor(
    private readonly concertService: ConcertService,
    private readonly reservationService: ReservationService,
    private readonly dataSource: DataSource,
  ) {}

  async registerReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
  }) {
    const concert = await this.concertService.findConcertInfoBySeatId({
      seatId: args.seatId,
      concertId: args.concertId,
    });

    const reservation = await this.dataSource
      .createEntityManager()
      .transaction(async (transactionalEntityManager) => {
        const reservation = await this.reservationService.registerReservation(
          {
            userId: args.userId,
            seatId: args.seatId,
            seatNumber: concert.seat.seatNumber,
            concertName: concert.name,
            price: concert.seat.price,
            openAt: concert.concertSchedule.openAt,
            closeAt: concert.concertSchedule.closeAt,
          },
          transactionalEntityManager,
        );

        await this.concertService.seatReservation(
          {
            seatId: args.seatId,
            concertId: args.concertId,
          },
          transactionalEntityManager,
        );
        return reservation;
      });

    return reservation;
  }

  async expireReservations(): Promise<
    {
      seatId: number;
    }[]
  > {
    const expireSeatsInfo = await this.dataSource
      .createEntityManager()
      .transaction(async (transactionalEntityManager) => {
        const expireSeatsInfo =
          await this.reservationService.expireReservations(
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

//되팔렘 방지를 위해 1계정 1좌석만 예약할 수 있도록 한다.
//유저 회원가입 , 로그인 과 같은 과제 요구사항 외 API(기능)들은  제외한다... 등등 정책을 개인적으로 정해놓고라도 해야할듯
