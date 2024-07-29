import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import Redlock, { Lock } from 'redlock';
import { internalServerError } from 'src/domain/exception/exceptions';
/* 레드락 적용 ( 레디스 추천방식 ) */
@Injectable()
export class RedisRedLockRepository {
  private redlock: Redlock;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {
    const node1 = this.redisClient.duplicate();
    const node2 = this.redisClient.duplicate();
    const node3 = this.redisClient.duplicate();
    const node4 = this.redisClient.duplicate();
    const node5 = this.redisClient.duplicate(); // 그냥 참고용으로 복제.
    this.redlock = new Redlock(
      [node1, node2, node3, node4, node5], // Redis 클라이언트 배열
      {
        driftFactor: 0.01, // 클럭 드리프트 보정 계수
        retryCount: 100000, // 재시도 횟수
        retryDelay: 10, // 재시도 간격 (ms)
        retryJitter: 100, // 재시도 지터 (랜덤 시간)
      },
    );
  }

  async acquireLock(key: string, ttl: number): Promise<Lock> {
    try {
      const lock = await this.redlock.acquire([key], ttl);
      console.log(lock);
      return lock;
    } catch (error) {
      throw internalServerError(error, {
        cause: 'Failed to acquire lock',
      });
    }
  }

  async releaseLock(lock: Lock): Promise<void> {
    try {
      await lock.release();
    } catch (error) {
      throw internalServerError(error, {
        cause: 'Failed to acquire lock',
      });
    }
  }
}
