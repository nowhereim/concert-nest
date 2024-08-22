import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { KafkaUserProducerImpl } from 'src/infrastructure/kafka/kafka-user.producer-impl';
import { ConsumerType } from 'src/presentation/events/user/enum/consumer-type.enum';
import { promisify } from 'util';
import { UserFacadeApp } from 'src/application/user/user.facade';
import { nanoid } from 'nanoid';
import * as request from 'supertest';

describe('User Message (e2e)', () => {
  let app: INestApplication;
  let kafkaProducer: KafkaUserProducerImpl;
  let userFacadeApp: UserFacadeApp;
  const uuid = nanoid();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    kafkaProducer = moduleFixture.get<KafkaUserProducerImpl>(
      KafkaUserProducerImpl,
    );
    userFacadeApp = moduleFixture.get<UserFacadeApp>(UserFacadeApp);
    await app.init();
    await promisify(setTimeout)(5000);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('메시지 발행 테스트', () => {
    it('결제생성 메시지를 임의로 발행하여 캐시 사용 수신을 확인', async () => {
      // 메시지 발행
      const message = {
        after: { userId: 1, totalAmount: 1 },
        transactionId: uuid,
      };
      /* 결제생성 메시지 발행 (캐시 사용) */
      await kafkaProducer.publishEvent({
        event: message,
        type: ConsumerType.PAYMENT as any,
      });

      await promisify(setTimeout)(1000);
      const result = await userFacadeApp.cashRead({ userId: 1 });
      /* 시드 데이터 (balance) 10000 */
      expect(result.cash.getBalance()).toEqual(9999);
    }, 60000);

    it('결제실패 메시지를 임의로 발행하여 사용한 캐시 롤백 확인', async () => {
      // 메시지 발행
      const message = {
        args: { userId: 1, transactionId: uuid },
      };
      /* 결제생성 메시지 발행 (캐시 사용) */
      await kafkaProducer.publishEvent({
        event: message,
        type: ConsumerType.PAYMENT as any,
      });

      await promisify(setTimeout)(1000);

      /* 결제실패 메시지 발행 (캐시 롤백) */
      await kafkaProducer.publishEvent({
        event: message,
        type: ConsumerType.PAYMENT_FAILED as any,
      });

      await promisify(setTimeout)(1000);

      const result = await userFacadeApp.cashRead({ userId: 1 });
      /* 시드 데이터 (balance) 10000 */
      expect(result.cash.getBalance()).toEqual(10000);
    }, 60000);
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
