import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from './repository/i.user.repository';
import { User } from './models/user';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async cashCharge(args: any) {
    const user = await this.userRepository.findByUserId({
      userId: args.userId,
    });
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    user.cashCharge(args.amount);
    return await this.userRepository.save(user);
  }

  async cashUse(
    args: { userId: number; amount: number },
    transactionalEntityManager?: EntityManager,
  ) {
    try {
      const user = await this.userRepository.findByUserId({
        userId: args.userId,
      });
      if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
      user.cashUse(args.amount);
      return await this.userRepository.save(user, transactionalEntityManager);
    } catch (e) {
      throw e;
    }
  }

  async findUser(args: { userId: number }) {
    const user = await this.userRepository.findByUserId(args);
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    return user;
  }

  async register(args: { name: string }) {
    const user = new User({ name: args.name });
    return await this.userRepository.register(user);
  }
}
