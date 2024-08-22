import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentService } from 'src/domain/payment/payment.service';
import { IPaymentRepository } from 'src/domain/payment/interface/i.payment.repository';
import { Payment, PaymentStatus } from 'src/domain/payment/payment';

describe('PaymentService Unit Test', () => {
  let service: PaymentService;
  let paymentRepository: jest.Mocked<IPaymentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'IPaymentRepository',
          useValue: {
            save: jest.fn(),
            findByPaymentId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get('IPaymentRepository');
  });

  describe('pay', () => {
    it('새로운 결제 생성 성공', async () => {
      const paymentArgs = {
        userId: 1,
        seatNumber: 1,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
        totalAmount: 100,
      };
      const mockPayment = new Payment({
        id: 1,
        ...paymentArgs,
        status: PaymentStatus.PENDING,
      });

      paymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.pay(paymentArgs);

      expect(result).toBe(mockPayment);
    });
  });

  describe('completePayment', () => {
    it('결제를 완료 처리 성공', async () => {
      const mockPayment = new Payment({
        id: 1,
        userId: 1,
        seatNumber: 1,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
        totalAmount: 100,
        status: PaymentStatus.PENDING,
      });

      paymentRepository.findById.mockResolvedValue(mockPayment);
      paymentRepository.save.mockResolvedValue(
        new Payment({
          ...mockPayment,
          status: PaymentStatus.COMPLETED,
        }),
      );

      const result = await service.completePayment({
        userId: 1,
        transactionId: 'test',
      });

      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('존재하지 않는 결제 완료 실패', async () => {
      paymentRepository.findById.mockResolvedValue(null);

      await expect(
        service.completePayment({ userId: 4576, transactionId: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('failPayment', () => {
    it('결제를 실패 처리 성공', async () => {
      const mockPayment = new Payment({
        id: 1,
        userId: 1,
        seatNumber: 1,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
        totalAmount: 100,
        status: PaymentStatus.PENDING,
      });

      paymentRepository.findById.mockResolvedValue(mockPayment);
      paymentRepository.save.mockResolvedValue(
        new Payment({
          ...mockPayment,
          status: PaymentStatus.FAILED,
        }),
      );

      const result = await service.failPayment({ transactionId: 'test' });

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(paymentRepository.findById).toHaveBeenCalledWith({
        paymentId: 1,
      });
      expect(paymentRepository.save).toHaveBeenCalledWith(expect.any(Payment));
    });

    it('존재하지 않는 결제 상태변경 실패', async () => {
      paymentRepository.findById.mockResolvedValue(null);

      await expect(
        service.failPayment({ transactionId: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
