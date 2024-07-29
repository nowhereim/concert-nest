import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { internalServerError } from 'src/domain/exception/exceptions';

@Injectable()
export class RedisPubSubLockRepository {
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {
    this.publisher = redisClient;
    this.subscriber = redisClient.duplicate();
  }

  async acquireLock(key: string, ttl: number): Promise<boolean> {
    const lockKey = `lock:${key}`;

    while (true) {
      try {
        const result = await this.publisher.set(
          lockKey,
          'locked',
          'PX',
          ttl,
          'NX',
        ); // 'PX'로 ttl을 밀리초 단위로 설정
        if (result === 'OK') {
          return true;
        }

        await this.waitForUnlock(key);
      } catch (e) {
        throw internalServerError(e, {
          cause: 'Failed to acquire lock',
        });
      }
    }
  }

  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.publisher.del(lockKey);
    await this.publisher.publish(lockKey, 'released');
  }

  async waitForUnlock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          internalServerError('요청에 실패 하였습니다.', {
            cause: `Failed to wait for unlock: ${key}`,
          }),
        );
      }, 1000); // 1초 대기 시간

      this.subscriber.subscribe(lockKey, (err) => {
        if (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });

      this.subscriber.on('message', (channel, message) => {
        if (channel === lockKey && message === 'released') {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }
}
