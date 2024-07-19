import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { SeederService } from 'src/seed/seeder.service';

describe('PaymentController (e2e)', () => {
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

  describe('/payment (POST)', () => {
    it('결제 요청', async () => {
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

      const paymentPayReqeustDto = {
        userId: issueTokenRequestDto.userId,
        seatNumber: 1,
        concertName: 'Concert Test',
        openAt: new Date().toISOString(),
        closeAt: new Date(new Date().getTime() + 1000000).toISOString(),
        totalAmount: 100,
      };

      await request(app.getHttpServer())
        .post('/payment')
        .set('queue-token', `${queueId}`)
        .send(paymentPayReqeustDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.any(Number),
            userId: paymentPayReqeustDto.userId,
            seatNumber: paymentPayReqeustDto.seatNumber,
            concertName: paymentPayReqeustDto.concertName,
            openAt: paymentPayReqeustDto.openAt,
            closeAt: paymentPayReqeustDto.closeAt,
            totalAmount: paymentPayReqeustDto.totalAmount,
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

      const paymentPayReqeustDto = {
        userId: issueTokenRequestDto.userId,
        seatNumber: -1, // 유효하지 않은 좌석 번호
        concertName: 'Concert Test',
        openAt: new Date().toISOString(),
        closeAt: new Date(new Date().getTime() + 1000000).toISOString(),
        totalAmount: -100, // 유효하지 않은 금액
      };

      await request(app.getHttpServer())
        .post('/payment')
        .set('queue-token', `${queueId}`)
        .send(paymentPayReqeustDto)
        .expect(400);
    });
  });
});
