import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { ConcertFacadeApp } from 'src/application/concert/concert.facade';
describe('ConcertFacade Integration Test', () => {
  let app: INestApplication;
  let concertFacade: ConcertFacadeApp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    concertFacade = module.get<ConcertFacadeApp>(ConcertFacadeApp);

    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('예약 가능 스케쥴 조회', () => {
    it('예약 가능 스케쥴 조회 성공', async () => {
      const concertId = 1;
      const concert = await concertFacade.findAvailableDate({ concertId });
      expect(concert).toEqual({
        id: 1,
        name: expect.any(String),
        concertSchedules: expect.any(Array),
      });
    });

    it('예약 가능 스케쥴 조회 실패', async () => {
      await expect(
        concertFacade.findAvailableDate({
          concertId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('예약 가능 좌석 조회', () => {
    it('예약 가능 좌석 조회 성공', async () => {
      const concertScheduleId = 1;
      const concert = await concertFacade.findAvailableSeats({
        concertScheduleId,
      });
      expect(concert).toEqual({
        id: 1,
        name: expect.any(String),
        concertSchedules: expect.any(Array),
      });
    });

    it('예약 가능 좌석 조회 실패', async () => {
      await expect(
        concertFacade.findAvailableSeats({
          concertScheduleId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
