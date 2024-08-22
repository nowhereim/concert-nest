import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import { KafkaPaymentProducerImpl } from 'src/infrastructure/kafka/kafka-paytment.producer-impl';
import { PaymentRepositoryImpl } from 'src/infrastructure/core/payment/payment.repository-impl';
import { Payment, PaymentStatus } from 'src/domain/payment/payment';
import { ConsumerType } from 'src/presentation/events/payment/enum/consumer-type.enum';
import { PaymentService } from 'src/domain/payment/payment.service';
import { OutboxReaderImpl } from 'src/infrastructure/event/outbox/payment/outbox.reader-impl';
import { EventType } from 'src/domain/events/event.dispatcher';

describe('Payment message (e2e)', () => {
  let app: INestApplication;
  let kafkaProducer: KafkaPaymentProducerImpl;
  let uuid: string;
  let repository: PaymentRepositoryImpl;
  let paymentService: PaymentService;
  let outboxReader: OutboxReaderImpl;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    kafkaProducer = moduleFixture.get<KafkaPaymentProducerImpl>(
      KafkaPaymentProducerImpl,
    );
    repository = moduleFixture.get<PaymentRepositoryImpl>('IPaymentRepository');
    paymentService = moduleFixture.get<PaymentService>(PaymentService);
    outboxReader = moduleFixture.get<OutboxReaderImpl>('IPaymentOutboxReader');

    uuid = nanoid();

    await app.init();
    await promisify(setTimeout)(5000);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('임의의 결제를 생성 후 예약 완료 메시지를 발행하여 결제 상태가 완료로 변경 확인', async () => {
    /* 결제 데이터 저장 */
    const payment = await repository.save(
      new Payment({
        userId: 1,
        seatNumber: 1,
        concertName: 'sexy taehwan concert',
        openAt: new Date(),
        closeAt: new Date(),
        totalAmount: 10000,
        status: PaymentStatus.PENDING,
      }),
    );

    /* 예약 상태 완료 변경 성공 이벤트 발행 */
    kafkaProducer.publishEvent({
      event: { after: { userId: payment.userId }, transactionId: uuid },
      type: ConsumerType.COMPLETE_RESERVATION as any,
    });

    await promisify(setTimeout)(1000);

    /* 결제 조회 */
    const getPayment = await repository.findById({
      paymentId: payment.id,
    });

    /* 결제 상태 완료 확인 */
    expect(getPayment.status).toBe(PaymentStatus.COMPLETED);
  }, 60000);

  it('임의의 결제를 생성 후 예약 완료 실패 메시지를 발행하여 결제 상태가 실패로 변경 확인', async () => {
    /* 결제 생성 */
    const payment = await paymentService.pay({
      userId: 1,
      seatNumber: 1,
      concertName: 'sexy taehwan concert',
      openAt: new Date(),
      closeAt: new Date(),
      totalAmount: 10000,
      transactionId: uuid,
    });

    /* 결제 상태 완료 변경 실패 이벤트 발행 */
    kafkaProducer.publishEvent({
      event: { transactionId: uuid },
      type: ConsumerType.PAYMENT_FAILED as any,
    });

    await promisify(setTimeout)(1000);

    /* 결제 조회 */
    const getPayment = await repository.findById({
      paymentId: payment.id,
    });

    /* 아웃박스 테이블 이벤트 데이터 조회 */
    const outbox = await outboxReader.findByTransactionId({
      transactionId: uuid,
      eventType: EventType.PAYMENT,
    });

    /* 결제 상태 실패 확인 */
    expect(getPayment.status).toBe(PaymentStatus.FAILED);

    /* 아웃박스 테이블 이벤트 상태 성공 확인 */
    expect(outbox.status).toBe('SUCCESS');
  });

  it('임의의 결제를 생성 후 캐시사용 실패 메시지를 발행하여 결제 상태가 실패로 변경 확인', async () => {
    /* 결제 생성 */
    const payment = await paymentService.pay({
      userId: 1,
      seatNumber: 1,
      concertName: 'sexy taehwan concert',
      openAt: new Date(),
      closeAt: new Date(),
      totalAmount: 10000,
      transactionId: uuid,
    });

    /* 캐시 사용 실패 이벤트 발행 */
    kafkaProducer.publishEvent({
      event: { transactionId: uuid },
      type: ConsumerType.CASH_USE_FAILED as any,
    });

    await promisify(setTimeout)(1000);

    /* 결제 조회 */
    const getPayment = await repository.findById({
      paymentId: payment.id,
    });

    /* 아웃박스 이벤트 조회 */
    const outbox = await outboxReader.findByTransactionId({
      transactionId: uuid,
      eventType: EventType.PAYMENT,
    });

    /* 결제 상태 실패 확인 */
    expect(getPayment.status).toBe(PaymentStatus.FAILED);

    /* 아웃박스 테이블 이벤트 성공 확인 */
    expect(outbox.status).toBe('SUCCESS');
  });

  it('임의의 결제를 생성 후 결제 완료 실패 메시지를 발행하여 결제 상태가 실패로 변경 확인', async () => {
    /* 결제 생성 */
    const payment = await paymentService.pay({
      userId: 1,
      seatNumber: 1,
      concertName: 'sexy taehwan concert',
      openAt: new Date(),
      closeAt: new Date(),
      totalAmount: 10000,
      transactionId: uuid,
    });

    /* 결제 실패 이벤트 발행 */
    kafkaProducer.publishEvent({
      event: { transactionId: uuid },
      type: ConsumerType.PAYMENT_FAILED as any,
    });

    await promisify(setTimeout)(1000);

    /* 결제 조회 */
    const getPayment = await repository.findById({
      paymentId: payment.id,
    });

    /* 아웃박스 이벤트 조회 */
    const outbox = await outboxReader.findByTransactionId({
      transactionId: uuid,
      eventType: EventType.PAYMENT,
    });

    /* 결제 상태 실패 확인 */
    expect(getPayment.status).toBe(PaymentStatus.FAILED);

    /* 아웃박스 테이블 이벤트 성공 확인 */
    expect(outbox.status).toBe('SUCCESS');
  });
});
