import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import { ConcertRepositoryImpl } from 'src/infrastructure/core/Concert/Concert.repository-impl';
import { KafkaConcertProducerImpl } from 'src/infrastructure/kafka/kafka-concert.producer-impl';
import { ConsumerType } from 'src/presentation/events/concert/enum/consumer-type.enum';

describe('Concert message (e2e)', () => {
  let app: INestApplication;
  let kafkaProducer: KafkaConcertProducerImpl;
  let uuid: string;
  let repository: ConcertRepositoryImpl;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    kafkaProducer = moduleFixture.get<KafkaConcertProducerImpl>(
      KafkaConcertProducerImpl,
    );
    repository = moduleFixture.get<ConcertRepositoryImpl>('IConcertRepository');

    uuid = nanoid();

    await app.init();
    await promisify(setTimeout)(5000);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('임의의 예약생성 메시지 발행 후 좌석 비활성화 확인', async () => {
    kafkaProducer.publishEvent({
      event: { after: { seatId: 1, concertId: 1 }, transactionId: uuid },
      type: ConsumerType.RESERVATION_SEAT as any,
    });
    await promisify(setTimeout)(1000);

    const getConcert = await repository.findBySeatId({
      seatId: 1,
    });
    const [schedule] = getConcert.concertSchedules;
    const [seat] = schedule.seats;

    expect(seat.isActive).toBe(false);
  });

  it('임의로 좌석 점유 후 결제실패 메시지 발행하여 비활성 좌석 활성상태로 변경 확인', async () => {
    kafkaProducer.publishEvent({
      event: { after: { seatId: 3, concertId: 1 }, transactionId: uuid },
      type: ConsumerType.RESERVATION_SEAT as any,
    });
    await promisify(setTimeout)(1000);

    kafkaProducer.publishEvent({
      event: { after: { seatNumber: 3 }, transactionId: uuid },
      type: ConsumerType.PAYMENT_FAILED as any,
    });

    await promisify(setTimeout)(1000);

    const getConcert = await repository.findBySeatId({
      seatId: 3,
    });

    const [schedule] = getConcert.concertSchedules;
    const [seat] = schedule.seats;

    expect(seat.isActive).toBe(true);
  });

  it('임의로 좌석 점유 후 예약만료 메시지 발행하여 비활성 좌석 활성상태로 변경 확인', async () => {
    kafkaProducer.publishEvent({
      event: { after: { seatId: 2, concertId: 1 }, transactionId: uuid },
      type: ConsumerType.RESERVATION_SEAT as any,
    });

    await promisify(setTimeout)(1000);

    kafkaProducer.publishEvent({
      event: {
        after: [
          {
            concertId: 1,
            seatId: 2,
          },
        ],
        transactionId: uuid,
      },
      type: ConsumerType.RESERVATIONS_EXPIRED as any,
    });

    await promisify(setTimeout)(1000);

    const getConcert = await repository.findBySeatId({
      seatId: 2,
    });
    const [schedule] = getConcert.concertSchedules;
    const [seat] = schedule.seats;

    expect(seat.isActive).toBe(true);
  });
});
