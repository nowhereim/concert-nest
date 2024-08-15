import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from './repository/i.user.repository';
import { internalServerError, notFound } from 'src/domain/exception/exceptions';
import { ICashRepository } from 'src/domain/user/repository/i.cash.repository';
import { EventDispatcher, EventType } from '../events/event.dispatcher';
import { IUserOutboxReader } from 'src/domain/events/interface/user-outbox-reader.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('ICashRepository')
    private readonly cashRepository: ICashRepository,
    @Inject('IUserOutboxReader')
    private readonly userOutboxReader: IUserOutboxReader,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async cashCharge(args: { userId: number; amount: number }) {
    const result = await this.cashRepository
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const cash = await this.cashRepository.findByUserIdWithPessimisticLock(
          {
            userId: args.userId,
          },
          transactionalEntityManager,
        );
        if (!cash)
          throw notFound('존재하지 않는 유저입니다.', {
            cause: `userId: ${args.userId} not found`,
          });
        cash.charge(args.amount);
        return await this.cashRepository.save(cash, transactionalEntityManager);
      });
    return result;
  }

  async rollbackCashUse(args: { transactionId: string }) {
    const userOutbox = await this.userOutboxReader.findByTransactionId({
      transactionId: args.transactionId,
      eventType: EventType.CASH_USE,
    });
    if (!userOutbox)
      throw notFound('캐시 사용 이벤트를 찾을 수 없습니다.', {
        cause: `transactionId: ${args.transactionId} not found`,
      });

    const user = await this.userRepository.findByUserId({
      userId: userOutbox.event.aggregateId,
    });
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${userOutbox.event.aggregateId} not found`,
      });
    user.cashCharge(userOutbox.event.args.amount);
    await this.userRepository
      .getTransactionManager()
      .transaction(async (transactionalEntityManager) => {
        const updateCash = await this.cashRepository.optimisticLockCashUpdate(
          {
            user,
          },
          transactionalEntityManager,
        );
        if (!updateCash)
          throw notFound('캐시 사용 롤백에 실패했습니다.', {
            cause: `userId: ${user.id} cash update failed`,
          });
      });
    return { userId: user.id, amount: userOutbox.event.args.amount };
  }

  async cashUse(args: {
    userId: number;
    amount: number;
    transactionId: string;
  }) {
    try {
      const user = await this.userRepository.findByUserId({
        userId: args.userId,
      });
      if (!user)
        throw notFound('존재하지 않는 유저입니다.', {
          cause: `userId: ${args.userId} not found`,
        });
      user.cashUse(args.amount);
      return await this.userRepository
        .getTransactionManager()
        .transaction(async (transactionalEntityManager) => {
          const updateCash = await this.cashRepository.optimisticLockCashUpdate(
            {
              user,
            },
            transactionalEntityManager,
          );
          if (!updateCash)
            throw notFound('캐시 사용에 실패했습니다.', {
              cause: `userId: ${args.userId} cash update failed`,
            });
          await this.eventDispatcher.cashUseEvent({
            targetBefore: user,
            targetAfter: user,
            args,
            transactionId: args.transactionId,
          });
          return user;
        });
    } catch (e) {
      await this.eventDispatcher.cashUseFailedEvent({
        args,
        transactionId: args.transactionId,
      });
      throw internalServerError(e, {
        cause: `userId: ${args.userId} cash use failed`,
      });
    }
  }

  async findUser(args: { userId: number }) {
    const user = await this.userRepository.findByUserId(args);
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    return user;
  }
}
