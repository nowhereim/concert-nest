import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentService } from 'src/domain/payment/payment.service';
import { IPaymentRepository } from 'src/domain/payment/i.payment.repository';
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
    it('새로운 결제를 생성해야 함', async () => {
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
    it('결제를 완료해야 함', async () => {
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

      paymentRepository.findByPaymentId.mockResolvedValue(mockPayment);
      paymentRepository.save.mockResolvedValue(
        new Payment({
          ...mockPayment,
          status: PaymentStatus.COMPLETED,
        }),
      );

      const result = await service.completePayment({ paymentId: 1 });

      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('결제를 찾지 못한 경우 NotFoundException을 던져야 함', async () => {
      paymentRepository.findByPaymentId.mockResolvedValue(null);

      await expect(service.completePayment({ paymentId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('failPayment', () => {
    it('결제를 실패 상태로 변경해야 함', async () => {
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

      paymentRepository.findByPaymentId.mockResolvedValue(mockPayment);
      paymentRepository.save.mockResolvedValue(
        new Payment({
          ...mockPayment,
          status: PaymentStatus.FAILED,
        }),
      );

      const result = await service.failPayment({ paymentId: 1 });

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(paymentRepository.findByPaymentId).toHaveBeenCalledWith({
        paymentId: 1,
      });
      expect(paymentRepository.save).toHaveBeenCalledWith(expect.any(Payment));
    });

    it('결제를 찾지 못한 경우 NotFoundException을 던져야 함', async () => {
      paymentRepository.findByPaymentId.mockResolvedValue(null);

      await expect(service.failPayment({ paymentId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
