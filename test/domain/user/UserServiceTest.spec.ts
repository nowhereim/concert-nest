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
    it('존재하지 않는 유저일 경우 NotFoundException을 던져야 함', async () => {
      userRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.cashCharge({ userId: 1, amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('잘못된 금액으로 충전할 경우 BadRequestException을 던져야 함', async () => {
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
    it('존재하지 않는 유저일 경우 NotFoundException을 던져야 함', async () => {
      userRepository.findByUserId.mockResolvedValue(null);

      await expect(service.cashUse({ userId: 1, amount: 100 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('잔액이 부족할 경우 BadRequestException을 던져야 함', async () => {
      const user = new User({
        id: 1,
        name: 'test',
        cash: new Cash({ userId: 1, balance: 50 }),
      });
      userRepository.findByUserId.mockResolvedValue(user);

      await expect(service.cashUse({ userId: 1, amount: 100 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('잘못된 금액으로 사용할 경우 BadRequestException을 던져야 함', async () => {
      const user = new User({
        id: 1,
        name: 'test',
        cash: new Cash({ userId: 1, balance: 100 }),
      });
      userRepository.findByUserId.mockResolvedValue(user);

      await expect(
        service.cashUse({ userId: 1, amount: -100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUser', () => {
    it('존재하지 않는 유저일 경우 NotFoundException을 던져야 함', async () => {
      userRepository.findByUserId.mockResolvedValue(null);

      await expect(service.findUser({ userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('register', () => {
    it('유저 등록이 정상적으로 수행되어야 함', async () => {
      const user = new User({ name: 'test' });
      userRepository.register.mockResolvedValue(user);

      const result = await service.register({ name: 'test' });

      expect(result).toEqual(user);
      expect(userRepository.register).toHaveBeenCalledWith(expect.any(User));
    });
  });
});
