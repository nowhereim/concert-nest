import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PaymentFacadeApp } from 'src/application/payment/payment.facade';
import { promisify } from 'util';

describe('PaymentFacade Integration Test', () => {
  let app: INestApplication;
  let paymentFacade: PaymentFacadeApp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    paymentFacade = module.get<PaymentFacadeApp>(PaymentFacadeApp);

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
  });
});
