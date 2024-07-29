import { Injectable } from '@nestjs/common';
import { ConcertConcurrencyControlTestService } from 'src/domain/concert/concurrencycontroltest/concert-concurrency-control-test.service';
import { internalServerError } from 'src/domain/exception/exceptions';
/* NOTE: 락 테스트용. 실사용 금지 */
@Injectable()
export class ConcertConcurrencyControlTestApp {
  private simpleLockStatus = false;
  private spinLockStatus = false;

  constructor(
    private readonly concertConcurrencyControlTestService: ConcertConcurrencyControlTestService,
  ) {}

  // Simple Lock
  async simpleLock(args: { seatId: number; concertId: number }) {
    while (this.simpleLockStatus) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.simpleLockStatus = true;
    try {
      await this.concertConcurrencyControlTestService.seatReservation(args);
    } catch (e) {
      throw internalServerError('Lock Error');
    } finally {
      this.simpleLockStatus = false;
    }
  }

  // Spin Lock
  async spinLock(args: { seatId: number; concertId: number }) {
    while (true) {
      if (!this.spinLockStatus) {
        this.spinLockStatus = true;
        break;
      }
    }
    try {
      await this.concertConcurrencyControlTestService.seatReservation(args);
    } catch (e) {
      throw internalServerError('Lock Error');
    } finally {
      this.spinLockStatus = false;
      console.log('Spin Lock Released');
    }
  }

  // Pub-Sub Lock
  async pubSubLock(args: { seatId: number; concertId: number }) {
    await this.concertConcurrencyControlTestService.pubSubLock(args);
  }

  // Redis Distributed Lock
  async redisDistributedLock(args: { seatId: number; concertId: number }) {
    await this.concertConcurrencyControlTestService.redisRedLock(args);
  }

  async KafkaConcurrencyControlTest(args: {
    seatId: number;
    concertId: number;
  }) {
    await this.concertConcurrencyControlTestService.sendKafkaMessage(args);
  }

  async RabbitMQConcurrencyControlTest(args: {
    seatId: number;
    concertId: number;
  }) {
    await this.concertConcurrencyControlTestService.sendRabbitMQMessage(args);
  }

  // Beta Lock
  async betaLock(args: { userId: number; seatId: number; concertId: number }) {
    await this.concertConcurrencyControlTestService.betaLock(args);
  }

  // Optimistic Lock
  async optimisticLock(args: { seatId: number; concertId: number }) {
    await this.concertConcurrencyControlTestService.optimisticLock(args);
  }

  async seatReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
  }) {
    await this.concertConcurrencyControlTestService.seatReservation(args);
  }

  async getSeatForTest(seatId: number) {
    return await this.concertConcurrencyControlTestService.getSeatForTest(
      seatId,
    );
  }
}
