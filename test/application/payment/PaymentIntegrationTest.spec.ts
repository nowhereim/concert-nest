import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PaymentFacadeApp } from 'src/application/payment/payment.facade';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { UserFacadeApp } from 'src/application/user/user.facade';
import { SeederService } from 'src/seed/seeder.service';
import { promisify } from 'util';

describe('PaymentFacade Integration Test', () => {
  let app: INestApplication;
  let paymentFacade: PaymentFacadeApp;
  let reservationFacade: ReservationFacadeApp;
  let userFacadeApp: UserFacadeApp;
  let queueFacadeApp: QueueFacadeApp;
  let seederService: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    paymentFacade = module.get<PaymentFacadeApp>(PaymentFacadeApp);
    reservationFacade = module.get<ReservationFacadeApp>(ReservationFacadeApp);
    userFacadeApp = module.get<UserFacadeApp>(UserFacadeApp);
    queueFacadeApp = module.get<QueueFacadeApp>(QueueFacadeApp);
    seederService = module.get<SeederService>(SeederService);
    await seederService.seed();

    await app.init();
    await promisify(setTimeout)(5000);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });
  describe('결제 생성', () => {
    it('결제 생성 성공', async () => {
      const userId = 1;
      const seatId = 1;
      const concertId = 1;
      const amount = 10000;
      await queueFacadeApp.createQueue({ userId });
      await userFacadeApp.cashCharge({
        userId,
        amount,
      });
      await reservationFacade.registerReservation({
        userId,
        seatId,
        concertId,
      });
      const payment = await paymentFacade.pay({
        userId,
        seatId,
      });
      expect(payment).toEqual({
        id: expect.any(Number),
        userId,
        status: 'PENDING',
        seatNumber: expect.any(Number),
        openAt: expect.any(Date),
        concertName: expect.any(String),
        closeAt: expect.any(Date),
        totalAmount: expect.any(Number),
      });
    });
    it('이미 결제된 좌석에 대한 결제 시도 실패', async () => {
      const userId = 1;
      const seatId = 1;

      await expect(
        paymentFacade.pay({
          userId,
          seatId,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('대기열에 등록되지 않은 사용자 결제 시도 실패', async () => {
      const userId = 100;
      const seatId = 1;

      await expect(
        paymentFacade.pay({
          userId,
          seatId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('결제 유저 캐시 동시성 테스트', () => {
    it('동일한 결제건에 대하여 중복 요청시 금액 차감은 하나만 반영되어야한다.', async () => {
      const userId = 1;
      const seatId = 1;
      const concertId = 1;

      await reservationFacade.registerReservation({
        userId,
        seatId,
        concertId,
      });

      const promises = Array.from({ length: 5 }).map(() =>
        paymentFacade.pay({
          userId,
          seatId,
        }),
      );

      await Promise.allSettled(promises);
      const getUserCash = await userFacadeApp.cashRead({
        userId,
      });
      expect(getUserCash.cash.getVersion()).toBe(2); // 버전컬럼이 1 => 2로 증가해야한다.
    }, 60000);
  });
});
