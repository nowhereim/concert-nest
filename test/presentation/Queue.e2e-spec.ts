import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { SeederService } from 'src/seed/seeder.service';

describe('QueueController (e2e)', () => {
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

  describe('/queue (POST)', () => {
    it('대기열 토큰을 발급', async () => {
      const issueTokenRequestDto = {
        userId: Math.floor(Math.random() * 1000) + 1,
      };

      await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('유효하지 않은 요청 값', async () => {
      const issueTokenRequestDto = {
        userId: 'invalid', // 유효하지 않은 유저 ID
      };

      await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(400);
    });
  });

  describe('/queue (GET)', () => {
    it('대기열 토큰 조회', async () => {
      const issueTokenRequestDto = {
        userId: Math.floor(Math.random() * 1000) + 1,
      };

      const issueTokenResponse = await request(app.getHttpServer())
        .post('/queue')
        .send(issueTokenRequestDto)
        .expect(201);

      const queueId = issueTokenResponse.body.id;

      await request(app.getHttpServer())
        .get('/queue')
        .set('queue-token', `${queueId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('유효하지않은 토큰', async () => {
      await request(app.getHttpServer())
        .get('/queue')
        .set('queue-token', '999999')
        .expect(401);
    });
  });
});
