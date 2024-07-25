import { Injectable } from '@nestjs/common';
import { Payment } from 'src/domain/payment/payment';
import { PaymentService } from 'src/domain/payment/payment.service';
import { QueueService } from 'src/domain/queue/queue.service';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { UserService } from 'src/domain/user/user.service';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentFacadeApp {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly reservationService: ReservationService,
    private readonly userService: UserService,
    private readonly queueService: QueueService,
    private readonly dataSource: DataSource,
  ) {}

  /* FIXME: 다음주에 리팩토링 하면서 단계를 줄여야겠다. */

  async pay(args: { userId: number; seatId: number }): Promise<Payment> {
    const reservation = await this.reservationService.getReservation({
      userId: args.userId,
    });
    return await this.dataSource
      .createEntityManager()
      .transaction(async (transactionalEntityManager) => {
        /* 캐시 사용 */
        await this.userService.cashUse(
          {
            userId: args.userId,
            amount: reservation.price,
          },
          transactionalEntityManager,
        );

        /* 결제 생성 */
        const payment = await this.paymentService.pay(
          {
            userId: args.userId,
            openAt: reservation.openAt,
            closeAt: reservation.closeAt,
            seatNumber: reservation.seatNumber,
            concertName: reservation.concertName,
            totalAmount: reservation.price,
          },
          transactionalEntityManager,
        );

        /* 예약 상태 변경 */
        await this.reservationService.completeReservation(
          {
            seatId: args.seatId,
          },
          transactionalEntityManager,
        );

        /* 대기열 큐 만료 */
        await this.queueService.expire(
          {
            userId: args.userId,
          },
          transactionalEntityManager,
        );

        /* 결제 상태 변경 */
        await this.paymentService.completePayment(
          {
            paymentId: payment.id,
          },
          transactionalEntityManager,
        );

        return payment;
      });
  }
}
