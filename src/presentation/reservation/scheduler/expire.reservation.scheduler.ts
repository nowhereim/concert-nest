import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';

@Injectable()
export class ReservationScheduler {
  constructor(private readonly reservationFacade: ReservationFacadeApp) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.reservationFacade.expireReservations();
  }
}
