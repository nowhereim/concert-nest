import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { SeederService } from 'src/seed/seeder.service';

describe('ConcertController (e2e)', () => {
  let app: INestApplication;
  let seederService: SeederService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    seederService = moduleFixture.get<SeederService>(SeederService);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await seederService.seed();
  });

  describe('/concert/available-dates (GET)', () => {
    it('조회 성공', async () => {
      const issueTokenRequestDto = {
        userId: 22,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      const findAvailableDateRequestDto = {
        concertId: 1,
      };

      await request(app.getHttpServer())
        .get('/concert/available-dates')
        .set('queue-token', `${queueId}`)
        .query(findAvailableDateRequestDto)
        .expect(200);
    });

    it('유효하지 않은 요청 값', async () => {
      const issueTokenRequestDto = {
        userId: 23,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      const findAvailableDateRequestDto = {
        concertId: 'invalid', // 유효하지 않은 concertId
      };

      await request(app.getHttpServer())
        .get('/concert/available-dates')
        .set('queue-token', `${queueId}`)
        .query(findAvailableDateRequestDto)
        .expect(400);
    });
  });

  describe('/concert/available-seats (GET)', () => {
    it('조회 성공', async () => {
      const issueTokenRequestDto = {
        userId: 3,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      const findAvailableSeatsRequestDto = {
        concertScheduleId: 1,
      };

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await request(app.getHttpServer())
        .get('/concert/available-seats')
        .set('queue-token', `${queueId}`)
        .query(findAvailableSeatsRequestDto)
        .expect(200);
    });

    it('유효하지 않은 요청 값', async () => {
      const issueTokenRequestDto = {
        userId: 555,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      const findAvailableSeatsRequestDto = {
        concertScheduleId: 'invalid', // 유효하지 않은 concertScheduleId
      };

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await request(app.getHttpServer())
        .get('/concert/available-seats')
        .set('queue-token', `${queueId}`)
        .query(findAvailableSeatsRequestDto)
        .expect(400);
    });
  });
});
