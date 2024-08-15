import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { IReservationRepository } from 'src/domain/reservation/interface/i.reservation.repository';
import {
  SeatReservation,
  SeatReservationStatus,
} from 'src/domain/reservation/seat.reservation';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepository: jest.Mocked<IReservationRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: 'IReservationRepository',
          useValue: {
            save: jest.fn(),
            findByUserId: jest.fn(),
            findBySeatId: jest.fn(),
            findExpired: jest.fn(),
            saveAll: jest.fn(),
            findAllByUserIdOrSeatId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get('IReservationRepository');
  });

  describe('registerReservation', () => {
    it('예약 생성 성공', async () => {
      const reservationArgs = {
        userId: 1,
        seatId: 1,
        concertId: 1,
        seatNumber: 1,
        price: 100,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
      };
      const mockReservation = new SeatReservation({
        id: 1,
        ...reservationArgs,
        status: SeatReservationStatus.PENDING,
      });

      reservationRepository.findAllByUserIdOrSeatId.mockResolvedValue([]);
      reservationRepository.save.mockResolvedValue(mockReservation);

      const result = await service.registerReservation(reservationArgs);

      expect(result).toBe(mockReservation);
    });
    it('이미 예약된 좌석 예약 실패', async () => {
      const reservationArgs = {
        userId: 1,
        seatId: 1,
        concertId: 1,
        seatNumber: 1,
        price: 100,
        concertName: 'Concert 1',
        openAt: new Date('2024-01-01'),
        closeAt: new Date('2024-12-31'),
      };
      const existingReservation = new SeatReservation({
        ...reservationArgs,
        status: SeatReservationStatus.PENDING,
      });
      reservationRepository.findAllByUserIdOrSeatId.mockResolvedValue([
        existingReservation,
      ]);

      await expect(
        service.registerReservation(reservationArgs),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getReservation', () => {
    it('예약 조회 성공', async () => {
      const reservation = new SeatReservation({
        id: 1,
        seatId: 1,
        userId: 1,
        concertId: 1,
        seatNumber: 1,
        price: 100,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
        status: SeatReservationStatus.PENDING,
      });
      reservationRepository.findByUserIdWithPending.mockResolvedValue(
        reservation,
      );

      const result = await service.findByUserIdWithPending({ userId: 1 });

      expect(result).toEqual(reservation);
    });
    it('존재하지 않는 예약 조회 실패', async () => {
      reservationRepository.findByUserIdWithPending.mockResolvedValue(null);

      await expect(
        service.findByUserIdWithPending({ userId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeReservation', () => {
    it('예약 완료 성공', async () => {
      const reservation = new SeatReservation({
        id: 1,
        seatId: 1,
        userId: 1,
        concertId: 1,
        seatNumber: 1,
        price: 100,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
        status: SeatReservationStatus.PENDING,
      });
      reservationRepository.findBySeatId.mockResolvedValue(reservation);
      reservationRepository.save.mockResolvedValue(reservation);

      const result = await service.completeReservation({
        userId: 1,
        transactionId: 'test',
      });

      expect(result).toEqual(reservation);
    });
    it('존재하지 않는 예약 완료 실패', async () => {
      reservationRepository.findBySeatId.mockResolvedValue(null);

      await expect(
        service.completeReservation({
          userId: 1,
          transactionId: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('expireReservation', () => {
    it('예약 만료 성공', async () => {
      const reservation = new SeatReservation({
        id: 1,
        seatId: 1,
        userId: 1,
        concertId: 1,
        seatNumber: 1,
        price: 100,
        concertName: 'Concert 1',
        openAt: new Date('2023-01-01'),
        closeAt: new Date('2023-12-31'),
        status: SeatReservationStatus.PENDING,
      });
      reservationRepository.findBySeatId.mockResolvedValue(reservation);
      reservationRepository.save.mockResolvedValue(reservation);

      const result = await service.expireReservation({ seatId: 1 });

      expect(result).toEqual(reservation);
    });

    it('존재하지 않는 예약 만료 실패', async () => {
      reservationRepository.findBySeatId.mockResolvedValue(null);

      await expect(service.expireReservation({ seatId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('expireReservations', () => {
    it('만료된 예약이 없을 경우 빈 배열 반환', async () => {
      reservationRepository.findExpired.mockResolvedValue([]);

      const result = await service.expireAllExpiredReservations();

      expect(result).toEqual([]);
      expect(reservationRepository.findExpired).toHaveBeenCalled();
    });

    it('만료된 예약이 있을 경우 해당 예약들을 반환', async () => {
      const expiredReservations = [
        new SeatReservation({
          id: 1,
          seatId: 1,
          userId: 1,
          concertId: 1,
          seatNumber: 1,
          price: 100,
          concertName: 'Concert 1',
          openAt: new Date('2023-01-01'),
          closeAt: new Date('2023-12-31'),
          status: SeatReservationStatus.PENDING,
        }),
      ];

      reservationRepository.findExpired.mockResolvedValue(expiredReservations);
      reservationRepository.saveAll.mockResolvedValue(expiredReservations);

      const result = await service.expireAllExpiredReservations();

      expect(result).toEqual(
        expiredReservations.map((reservation) => ({
          seatId: reservation.seatId,
          concertId: reservation.concertId,
        })),
      );
      expect(reservationRepository.findExpired).toHaveBeenCalled();
    });
  });
});
