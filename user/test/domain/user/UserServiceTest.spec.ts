import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/domain/user/user.service';
import { IUserRepository } from 'src/domain/user/repository/i.user.repository';
import { User } from 'src/domain/user/models/user';
import { Cash } from 'src/domain/user/models/cash';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: {
            findByUserId: jest.fn(),
            save: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
  });

  describe('cashCharge', () => {
    it('존재하지 않는 유저 충전 실패', async () => {
      userRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.cashCharge({ userId: 1, amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('잘못된 금액 충전 실패', async () => {
      const user = new User({
        id: 1,
        name: 'test',
        cash: new Cash({ userId: 1, balance: 100 }),
      });
      userRepository.findByUserId.mockResolvedValue(user);

      await expect(
        service.cashCharge({ userId: 1, amount: -100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cashUse', () => {
    it('존재하지 않는 유저 사용 실패', async () => {
      userRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.cashUse({ userId: 1, amount: 100, transactionId: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('잔액 부족 사용 실패', async () => {
      const user = new User({
        id: 1,
        name: 'test',
        cash: new Cash({ userId: 1, balance: 50 }),
      });
      userRepository.findByUserId.mockResolvedValue(user);

      await expect(
        service.cashUse({ userId: 1, amount: 100, transactionId: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('잘못된 금액 사용 실패', async () => {
      const user = new User({
        id: 1,
        name: 'test',
        cash: new Cash({ userId: 1, balance: 100 }),
      });
      userRepository.findByUserId.mockResolvedValue(user);

      await expect(
        service.cashUse({ userId: 1, amount: -100, transactionId: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUser', () => {
    it('유저 조회 성공', async () => {
      const user = new User({ name: 'test' });
      userRepository.findByUserId.mockResolvedValue(user);

      const result = await service.findUser({ userId: 1 });

      expect(result).toEqual(user);
    });

    it('존재하지 않는 유저 조회 실패', async () => {
      userRepository.findByUserId.mockResolvedValue(null);

      await expect(service.findUser({ userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
