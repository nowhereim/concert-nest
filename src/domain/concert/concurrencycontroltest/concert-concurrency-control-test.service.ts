import { Injectable } from '@nestjs/common';
import { KafkaConcertRepositoryTest } from 'src/infrastructure/kafka/kafka-concert.repository';
import { RabbitMQConcertRepository } from 'src/infrastructure/rabbitmq/rabbitmq-concert.repository';
import { UpdateResult } from 'typeorm';
import {
  badRequest,
  internalServerError,
  notFound,
} from 'src/domain/exception/exceptions';
import { ConcertRepositoryForConcurrencyControlTest } from 'src/infrastructure/concert/concurrenctycontroltest/concert.repository';
import { SeatRepositoryForConcurrencyControlTest } from 'src/infrastructure/concert/concurrenctycontroltest/seat.repository';
import { RedisRedLockRepository } from 'src/infrastructure/redis/redis.repositoryv1';
import { Lock } from 'redlock';
import { RedisPubSubLockRepository } from 'src/infrastructure/redis/redis.repositoryv3';
import { ConcertScheduleRepositoryForConcurrencyControlTest } from 'src/infrastructure/concert/concurrenctycontroltest/concert-schedule.repository';
@Injectable()
export class ConcertConcurrencyControlTestService {
  constructor(
    private readonly kafkaConcertRepositoryTest: KafkaConcertRepositoryTest,
    private readonly rabbitMQConcertRepository: RabbitMQConcertRepository,
    private readonly concertRepositoryForConcurrencyControlTest: ConcertRepositoryForConcurrencyControlTest,
    private readonly seatRepositoryForConcurrencyControlTest: SeatRepositoryForConcurrencyControlTest,
    private readonly concertScheduleRepositoryForConcurrencyControlTest: ConcertScheduleRepositoryForConcurrencyControlTest,
    private readonly redisRedLockRepository: RedisRedLockRepository,
    private readonly redisPubSubLockRepository: RedisPubSubLockRepository,
  ) {}

  // Kafka
  async sendKafkaMessage(args: {
    seatId: number;
    concertId: number;
  }): Promise<void> {
    await this.kafkaConcertRepositoryTest.sendMessageToReservationSeat(args);
  }

  // RabbitMQ
  async sendRabbitMQMessage(args: {
    seatId: number;
    concertId: number;
  }): Promise<void> {
    await this.rabbitMQConcertRepository.sendMessageToReservationSeat(args);
  }

  // Beta Lock
  async betaLock(args: { userId: number; seatId: number; concertId: number }) {
    await this.seatReservationWithPessimisticLock(args);
  }

  // Optimistic Lock
  async optimisticLock(args: { seatId: number; concertId: number }) {
    await this.seatReservationWithOptimisticLock(args);
  }

  // Redis 분산락(레드락)
  async redisRedLock(args: { seatId: number; concertId: number }) {
    let lock: Lock | null = null;
    try {
      lock = await this.redisRedLockRepository.acquireLock(
        args.concertId.toString(),
        2000, //실제로 까지 걸리지 않는다.
      );
      await this.seatReservation(args);
    } catch (e) {
      throw internalServerError(e, {
        cause: 'Failed to acquire lock',
      });
    } finally {
      this.redisRedLockRepository.releaseLock(lock);
    }
  }

  // Pub-Sub Lock
  async pubSubLock(args: { seatId: number; concertId: number }) {
    try {
      await this.redisPubSubLockRepository.acquireLock(
        `reservationSeat:${args.concertId}`,
        2000, // 실제로까지 걸리지 않는다.
      );

      await this.seatReservation(args);
    } catch (e) {
      throw internalServerError(e, {
        cause: 'Failed to acquire lock',
      });
    } finally {
      await this.redisPubSubLockRepository.releaseLock(
        `reservationSeat:${args.concertId}`,
      );
    }
  }

  //낙관락
  async seatReservationWithOptimisticLock(args: {
    seatId: number;
    concertId: number;
  }): Promise<UpdateResult> {
    return await this.concertRepositoryForConcurrencyControlTest
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const concert =
          await this.concertRepositoryForConcurrencyControlTest.findByConcertId(
            {
              concertId: args.concertId,
            },
          );
        if (!concert)
          throw notFound('예약 가능한 콘서트가 없습니다.', {
            cause: `concertId : ${args.concertId} not found`,
          });
        const concertSchedule = concert.seatDeactivate(args) as any;
        const updatedConcert =
          await this.seatRepositoryForConcurrencyControlTest.updateIsActiveWithOptimisticLock(
            {
              concert,
              seatId: args.seatId,
            },
            transactionalEntityManager,
          );

        if (updatedConcert.affected === 0)
          throw badRequest('이미 예약된 좌석 입니다.', {
            cause: `seatId : ${args.seatId} already reserved`,
          });

        const updateConcertSchedule =
          await this.concertScheduleRepositoryForConcurrencyControlTest.updateReservedSeatsWithOptimisticLock(
            { concertSchedule },
            transactionalEntityManager,
          );

        if (updateConcertSchedule.affected === 0)
          throw badRequest('존재 하지 않는 스케쥴 입니다.', {
            cause: `seatId : ${args.seatId} already reserved`,
          });

        return updatedConcert;
      });
  }

  //비관락
  async seatReservationWithPessimisticLock(args: {
    seatId: number;
    concertId: number;
  }): Promise<UpdateResult> {
    return await this.concertRepositoryForConcurrencyControlTest
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const concert =
          await this.concertRepositoryForConcurrencyControlTest.findByConcertIdWithPessimisticLock(
            {
              concertId: args.concertId,
            },
            transactionalEntityManager,
          );

        if (!concert)
          throw notFound('예약 가능한 콘서트가 없습니다.', {
            cause: `concertId : ${args.concertId} not found`,
          });
        const concertSchedule = concert.seatDeactivate(args) as any;
        const updatedConcert =
          await this.seatRepositoryForConcurrencyControlTest.updateIsActive(
            {
              concert,
              seatId: args.seatId,
            },
            transactionalEntityManager,
          );

        if (updatedConcert.affected === 0)
          throw badRequest('이미 예약된 좌석 입니다.', {
            cause: `seatId : ${args.seatId} already reserved`,
          });

        const updateConcertSchedule =
          await this.concertScheduleRepositoryForConcurrencyControlTest.updateReservedSeats(
            { concertSchedule },
            transactionalEntityManager,
          );

        if (updateConcertSchedule.affected === 0)
          throw badRequest('존재 하지 않는 스케쥴 입니다.', {
            cause: `seatId : ${args.seatId} already reserved`,
          });

        return updatedConcert;
      });
  }

  //테스트용 시트 조회
  async getSeatForTest(seatId: number) {
    return await this.seatRepositoryForConcurrencyControlTest.findBySeatId({
      seatId,
    });
  }

  // 기본 저장
  async seatReservation(args: {
    seatId: number;
    concertId: number;
  }): Promise<UpdateResult> {
    const concert =
      await this.concertRepositoryForConcurrencyControlTest.findByConcertId({
        concertId: args.concertId,
      });
    if (!concert)
      throw notFound('예약 가능한 콘서트가 없습니다.', {
        cause: `concertId : ${args.concertId} not found`,
      });

    const concertSchedule = concert.seatDeactivate(args) as any;
    const updatedConcert =
      await this.seatRepositoryForConcurrencyControlTest.updateIsActive({
        concert,
        seatId: args.seatId,
      });

    if (updatedConcert.affected === 0)
      throw badRequest('이미 예약된 좌석 입니다.', {
        cause: `seatId : ${args.seatId} already reserved`,
      });

    const updateConcertSchedule =
      await this.concertScheduleRepositoryForConcurrencyControlTest.updateReservedSeats(
        { concertSchedule },
      );

    if (updateConcertSchedule.affected === 0)
      throw badRequest('존재 하지 않는 스케쥴 입니다.', {
        cause: `seatId : ${args.seatId} already reserved`,
      });

    return updatedConcert;
  }
}
