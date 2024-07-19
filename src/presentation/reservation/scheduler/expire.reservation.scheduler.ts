import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade(app)';

@Injectable()
export class ReservationScheduler {
  constructor(private readonly reservationFacade: ReservationFacadeApp) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    await this.reservationFacade.expireReservations();
  }
}
