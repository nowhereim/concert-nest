import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { SeederService } from 'src/seed/seeder.service';

describe('ReservationController (e2e)', () => {
  let app: INestApplication;
  let seederService: SeederService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    seederService = moduleFixture.get<SeederService>(SeederService);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await seederService.seed();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reservation (POST)', () => {
    it('예약 요청', async () => {
      const issueTokenRequestDto = {
        userId: 1,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      // 3초 대기
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const registerReservationDto = {
        userId: issueTokenRequestDto.userId,
        seatId: 1,
        concertId: 1,
      };

      await request(app.getHttpServer())
        .post('/reservation')
        .set('queue-token', `${queueId}`)
        .send(registerReservationDto)
        .expect(201)
        .expect((res) => {
          expect(res).toEqual({
            id: expect.any(Number),
            price: expect.any(Number),
            status: expect.any(String),
            concertName: expect.any(String),
            seatNumber: expect.any(Number),
            openAt: expect.any(String),
            closeAt: expect.any(String),
          });
        });
    });

    it('유효하지 않은 요청 값', async () => {
      const issueTokenRequestDto = {
        userId: 2,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      // 3초 대기
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const registerReservationDto = {
        userId: issueTokenRequestDto.userId,
        seatId: -1, // 유효하지 않은 좌석 ID
        concertId: -1, // 유효하지 않은 콘서트 ID
      };

      await request(app.getHttpServer())
        .post('/reservation')
        .set('queue-token', `${queueId}`)
        .send(registerReservationDto)
        .expect(400);
    });
  });
});
