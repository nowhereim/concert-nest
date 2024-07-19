import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PaymentFacadeApp } from 'src/application/payment/payment.facade(app)';
import { QueueFacadeApp } from 'src/application/queue/queue.facade(app)';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade(app)';
import { UserFacadeApp } from 'src/application/user/user.facade(app)';
import { SeederService } from 'src/seed/seeder.service';

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
  });

  afterEach(async () => {
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
});
