import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from './repository/i.user.repository';
import { notFound } from 'src/domain/exception/exceptions';
import { ICashRepository } from 'src/domain/user/repository/i.cash.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('ICashRepository')
    private readonly cashRepository: ICashRepository,
  ) {}

  async cashCharge(args: { userId: number; amount: number }) {
    return await this.cashRepository
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
  }

  async cashUse(
    args: { userId: number; amount: number },
    transactionalEntityManager?: EntityManager,
  ) {
    const user = await this.userRepository.findByUserId({
      userId: args.userId,
    });
    if (!user)
      throw notFound('존재하지 않는 유저입니다.', {
        cause: `userId: ${args.userId} not found`,
      });
    user.cashUse(args.amount);
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
    return user;
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
