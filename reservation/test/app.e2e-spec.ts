import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import { KafkaReservationProducerImpl } from 'src/infrastructure/kafka/kafka-reservation.producer-impl';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ConsumerType } from 'src/presentation/events/reservation/enum/consumer.enum';
import { OutboxReaderImpl } from 'src/infrastructure/event/outbox/reservation/outbox.reader-impl';
import { ReservationRepositoryImpl } from 'src/infrastructure/core/reservation/reservation.repository-impl';
import {
  SeatReservation,
  SeatReservationStatus,
} from 'src/domain/reservation/seat.reservation';
import { EntityManager } from 'typeorm';
import {
  OutboxEntity,
  OutboxStatus,
} from 'src/infrastructure/event/outbox/reservation/outbox.entity';

describe('Reservation message (e2e)', () => {
  let app: INestApplication;
  let kafkaProducer: KafkaReservationProducerImpl;
  let reservationFacadeApp: ReservationFacadeApp;
  let outboxReader: OutboxReaderImpl;
  let uuid: string;
  let repository: ReservationRepositoryImpl;
  let entityManager: EntityManager;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    kafkaProducer = moduleFixture.get<KafkaReservationProducerImpl>(
      KafkaReservationProducerImpl,
    );
    reservationFacadeApp =
      moduleFixture.get<ReservationFacadeApp>(ReservationFacadeApp);
    outboxReader = moduleFixture.get<OutboxReaderImpl>(
      'IReservationOutboxReader',
    );
    repository = moduleFixture.get<ReservationRepositoryImpl>(
      'IReservationRepository',
    );
    entityManager = moduleFixture.get<EntityManager>(EntityManager);

    uuid = nanoid();

    await app.init();
    await promisify(setTimeout)(5000);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('임의로 예약 생성 후 캐시사용 메시지를 발행하여 예약 상태가 완료로 변경 확인', async () => {
    /* 예약 생성 */
    const reservation = await reservationFacadeApp.registerReservation({
      userId: 51,
      concertId: 1,
      seatId: 1,
    });

    /* 캐시 사용 이벤트 발행 */
    await kafkaProducer.publishEvent({
      event: { after: { id: 51 }, transactionId: uuid },
      type: ConsumerType.CASH_USE as any,
    });

    await promisify(setTimeout)(1000);

    /* 예약 조회 */
    const getReservation = await reservationFacadeApp.findById({
      id: reservation.id,
    });

    /* 아웃박스 조회 */
    const outbox = await outboxReader.findByTransactionId({
      transactionId: uuid,
      eventType: ConsumerType.CASH_USE as any,
    });

    /* 아웃박스 상태 확인 */
    expect(outbox.status).toEqual('SUCCESS');

    /* 예약 상태 확인 */
    expect(getReservation.status).toEqual('COMPLETE');
  });

  it('임의로 예약 생성 후 결제완료 실패 메시지를 발행하여 예약 상태가 실패로 변경 확인', async () => {
    const reservation = await reservationFacadeApp.registerReservation({
      userId: 21,
      concertId: 1,
      seatId: 2,
    });

    kafkaProducer.publishEvent({
      event: { transactionId: uuid },
      type: ConsumerType.PAYMENT_FAILED as any,
    });

    await promisify(setTimeout)(1000);

    const getReservation = await reservationFacadeApp.findById({
      id: reservation.id,
    });
    const outbox = await outboxReader.findByTransactionId({
      transactionId: uuid,
      eventType: ConsumerType.PAYMENT_FAILED as any,
    });

    expect(outbox.status).toEqual('SUCCESS');
    expect(getReservation.status).toEqual('FAIL');
  });

  it('임의로 예약 생성 후 배치서버에 의해 발행되는 만료된 예약 만료 메시지를 발행하여 예약 상태가 만료로 변경 확인', async () => {
    /* 임의로 생성시점이 오래된 예약 생성 */
    const reservation = new SeatReservation({
      seatId: 1,
      userId: 1,
      concertId: 1,
      status: SeatReservationStatus.PENDING,
      seatNumber: 1,
      price: 1,
      concertName: 'string',
      openAt: new Date('2021-09-01 00:00:00'),
      closeAt: new Date('2025-09-01 00:00:00'),
      createdAt: new Date('2021-09-01 00:00:00'),
    });

    /* 오래된 임의 예약 저장 */
    await repository.save(reservation);

    /* 만료된 예약 만료 메시지 발행 */
    kafkaProducer.publishEvent({
      event: { transactionId: uuid },
      type: ConsumerType.RESERVATION_EXPIRE as any,
    });

    await promisify(setTimeout)(1000);

    const getReservation = await reservationFacadeApp.findById({
      id: reservation.id,
    });

    /* 배치서버에서 발행되는 메시지ss는 아웃박스테이블에 적재되지않는다. */

    expect(getReservation.status).toEqual('EXPIRED');
  });

  it('임의로 아웃박스 테이블에 PENDING 상태의 이벤트를 저장하고 배치서버에 의해 발행되는 오래된 이벤트 재발행 이벤트를 발행하여 상태가 SUCCESS로 변경 확인', async () => {
    /* 임의의 오래된 이벤트 삽입 */
    await entityManager.save(
      OutboxEntity,
      new OutboxEntity({
        transactionId: uuid,
        eventType: ConsumerType.PAYMENT_FAILED as any,
        status: OutboxStatus.PENDING,
        event: { transactionId: uuid },
        createdAt: new Date('2021-09-01 00:00:00'),
      }),
    );

    /* 오래된 이벤트 재발행 메시지 발행  */
    kafkaProducer.publishEvent({
      event: { transactionId: uuid },
      type: ConsumerType.REPROCESS_PENDING_EVENTS as any,
    });

    await promisify(setTimeout)(5000);

    /* 오래된 이벤트 상태 성공으로 변경 확인 */
    const getOutbox = await outboxReader.findByTransactionId({
      transactionId: uuid,
      eventType: ConsumerType.PAYMENT_FAILED as any,
    });

    expect(getOutbox.status).toEqual('SUCCESS');
  }, 60000);
});
