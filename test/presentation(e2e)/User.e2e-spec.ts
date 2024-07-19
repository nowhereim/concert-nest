import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { SeederService } from 'src/seed/seeder.service';

describe('UserController (e2e)', () => {
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

  describe('/user/cash (POST)', () => {
    it('포인트 충전', async () => {
      const userCashChargeDto = {
        userId: 1,
        amount: 1000,
      };

      await request(app.getHttpServer())
        .post('/user/cash')
        .send(userCashChargeDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            balance: 1000,
          });
        });
    });

    it('유효하지 않은 충전 금액', async () => {
      const userCashChargeDto = {
        userId: 1,
        amount: -1000, // 유효하지 않은 금액
      };

      await request(app.getHttpServer())
        .post('/user/cash')
        .send(userCashChargeDto)
        .expect(400);
    });
  });

  describe('/user/cash (GET)', () => {
    it('잔액 조회', async () => {
      await request(app.getHttpServer())
        .get('/user/cash')
        .query({ userId: 1 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            balance: 1000,
          });
        });
    });

    it('유효하지 않은 요청 값', async () => {
      await request(app.getHttpServer())
        .get('/user/cash')
        .query({ userId: 'invalid' }) // 유효하지 않은 유저 ID
        .expect(400);
    });

    it('존재하지않는 유저', async () => {
      await request(app.getHttpServer())
        .get('/user/cash')
        .query({ userId: 999 }) // 존재하지 않는 유저 ID
        .expect(404);
    });
  });
});
