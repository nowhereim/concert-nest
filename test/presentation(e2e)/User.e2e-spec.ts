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
    await app.init();
  });

  afterAll(async () => {
    await seederService.seed();
    await app.close();
  });

  describe('/user/cash (POST)', () => {
    it('유효한 데이터로 포인트를 충전해야 함', async () => {
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

    it('유효하지 않은 데이터로 포인트를 충전할 때 400 에러를 반환해야 함', async () => {
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
    it('유효한 데이터로 포인트를 조회해야 함', async () => {
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

    it('유효하지 않은 데이터로 포인트를 조회할 때 400 에러를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .get('/user/cash')
        .query({ userId: 'invalid' }) // 유효하지 않은 유저 ID
        .expect(400);
    });

    it('존재하지 않는 유저의 포인트를 조회할 때 404 에러를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .get('/user/cash')
        .query({ userId: 999 }) // 존재하지 않는 유저 ID
        .expect(404);
    });
  });
});
