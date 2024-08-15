import {
  BadRequestException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
describe('ReservationFacade Integration Test', () => {
  let app: INestApplication;
  let reservationFacade: ReservationFacadeApp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    reservationFacade = module.get<ReservationFacadeApp>(ReservationFacadeApp);

    await app.init();
  }, 60000);

  afterAll(async () => {
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
        concertId,
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

  describe('예약(좌석 점유) 동시성 테스트', () => {
    it('예약 동시성 테스트', async () => {
      const seatId = 1;
      const concertId = 1;
      const reservationPromises = Array.from({ length: 9 }).map((_, userId) =>
        reservationFacade.registerReservation({
          userId: userId + 1,
          seatId,
          concertId,
        }),
      );

      const results = await Promise.allSettled(reservationPromises);

      // 결과 분석
      const fulfilled = results.filter(
        (result) => result.status === 'fulfilled',
      );
      const rejected = results.filter((result) => result.status === 'rejected');

      // 성공한 예약은 한 개, 나머지는 실패해야 함
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(8);

      // 실패한 이유가 BadRequestException이어야 함
      rejected.forEach((result) => {
        if (result.status === 'rejected') {
          expect(result.reason).toBeInstanceOf(BadRequestException);
        }
      });
    }, 10000);
  });

  describe('예약 만료 ', () => {
    it('예약 후 확정되지않고 만료시간이 도래한 예약 만료처리', async () => {
      const expireSeatsInfo =
        await reservationFacade.expireAllExpiredReservations();
      expect(expireSeatsInfo).toEqual(expect.arrayContaining([]));
    });
  });

  describe('예약 동시성 테스트', () => {
    it('동일한 좌석에 다수의 요청이 접근할 경우 한 건만 반영되어야한다.', async () => {
      const seatId = 1;
      const concertId = 1;
      const reservationPromises = Array.from({ length: 9 }).map((_, userId) =>
        reservationFacade.registerReservation({
          userId: userId + 1,
          seatId,
          concertId,
        }),
      );

      const results = await Promise.allSettled(reservationPromises);

      // 결과 분석
      const fulfilled = results.filter(
        (result) => result.status === 'fulfilled',
      );
      const rejected = results.filter((result) => result.status === 'rejected');

      // 성공한 예약은 한 개, 나머지는 실패해야 함
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(8);

      // 실패한 이유가 BadRequestException이어야 함
      rejected.forEach((result) => {
        if (result.status === 'rejected') {
          expect(result.reason).toBeInstanceOf(BadRequestException);
        }
      });
    }, 10000);
  });
});
