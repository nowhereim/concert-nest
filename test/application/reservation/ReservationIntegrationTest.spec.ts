import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade(app)';
import { SeederService } from 'src/seed/seeder.service';
describe('ReservationFacade Integration Test', () => {
  let app: INestApplication;
  let reservationFacade: ReservationFacadeApp;
  let seederService: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    reservationFacade = module.get<ReservationFacadeApp>(ReservationFacadeApp);
    seederService = module.get<SeederService>(SeederService);

    await app.init();
  });

  afterEach(async () => {
    await seederService.seed();
    await app.close();
  });

  describe('예약 생성', () => {
    it('예약 생성 성공', async () => {
      const userId = 1;
      const seatId = 1;
      const concertId = 1;
      const reservation = await reservationFacade.registerReservation({
        userId,
        seatId,
        concertId,
      });
      expect(reservation).toEqual({
        id: expect.any(Number),
        userId,
        seatId,
        seatNumber: expect.any(Number),
        status: 'PENDING',
        concertName: expect.any(String),
        price: expect.any(Number),
        openAt: expect.any(Date),
        closeAt: expect.any(Date),
        createdAt: expect.any(Date),
        deletedAt: null,
      });
    });

    /* 1인 1회 1좌석 결제를 정책으로 잡음. */
    it('이미 좌석을 예약중(결제 전) 인 사용자 예약 실패', async () => {
      const userId = 1;
      const seatId = 1;
      const concertId = 1;
      await reservationFacade.registerReservation({
        userId,
        seatId,
        concertId,
      });
      await expect(
        reservationFacade.registerReservation({
          userId,
          seatId,
          concertId,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('이미 예약된 좌석 예약 실패', async () => {
      const userId = 2;
      const seatId = 1;
      const concertId = 1;
      await reservationFacade.registerReservation({
        userId,
        seatId,
        concertId,
      });

      await expect(
        reservationFacade.registerReservation({
          userId,
          seatId,
          concertId,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('존재 하지 않는 좌석 예약 실패', async () => {
      const userId = 3;
      const seatId = 100;
      const concertId = 1;

      await expect(
        reservationFacade.registerReservation({
          userId,
          seatId,
          concertId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('예약 만료 (스케쥴러)', () => {
    it('예약 후 확정되지않고 만료시간이 도래한 예약 만료처리', async () => {
      const expireSeatsInfo = await reservationFacade.expireReservations();
      expect(expireSeatsInfo).toEqual(expect.arrayContaining([]));
    });
  });
});
