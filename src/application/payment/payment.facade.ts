import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PaymentEvent } from 'src/events/payment/producer/payment.event';
import { Payment } from 'src/domain/payment/payment';
import { PaymentService } from 'src/domain/payment/payment.service';
import { QueueService } from 'src/domain/queue/queue.service';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { UserService } from 'src/domain/user/user.service';
import { DataSource } from 'typeorm';
import { TranjactionId } from 'src/events/enum/tranjaction-id.enum';

@Injectable()
export class PaymentFacadeApp {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly reservationService: ReservationService,
    private readonly userService: UserService,
    private readonly queueService: QueueService,
    private readonly dataSource: DataSource,
    private readonly eventBus: EventBus,
  ) {}

  async pay(args: { userId: number; seatId: number }): Promise<Payment> {
    const reservation = await this.reservationService.getReservation({
      userId: args.userId,
    });
    const payment = await this.dataSource
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
        await this.queueService.expireToken({
          userId: args.userId,
        });

        /* 결제 상태 변경 */
        await this.paymentService.completePayment(
          {
            paymentId: payment.id,
          },
          transactionalEntityManager,
        );
        return payment;
      });

    /* TODO: 비동기 이벤트 발행 예시 ( 추후 이동 및 변경 가능 ) */
    this.eventBus.publish(new PaymentEvent(TranjactionId.SUCCESS, payment));
    return payment;
  }
}
