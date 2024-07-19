import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { IReservationRepository } from 'src/domain/reservation/i.reservation.repository';
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
    it('이미 예약된 좌석일 경우 ForbiddenException을 던져야 함', async () => {
      const reservationArgs = {
        userId: 1,
        seatId: 1,
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
    it('예약을 찾지 못하면 NotFoundException을 던져야 함', async () => {
      reservationRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getReservation({ userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeReservation', () => {
    it('예약을 찾지 못하면 NotFoundException을 던져야 함', async () => {
      reservationRepository.findBySeatId.mockResolvedValue(null);

      await expect(service.completeReservation({ seatId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('expireReservation', () => {
    it('예약을 찾지 못하면 NotFoundException을 던져야 함', async () => {
      reservationRepository.findBySeatId.mockResolvedValue(null);

      await expect(service.expireReservation({ seatId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('expireReservations', () => {
    it('만료된 예약이 없으면 빈 배열을 반환해야 함', async () => {
      reservationRepository.findExpired.mockResolvedValue([]);

      const result = await service.expireReservations();

      expect(result).toEqual([]);
      expect(reservationRepository.findExpired).toHaveBeenCalled();
    });

    it('만료된 예약이 있을 경우 해당 예약들을 반환해야 함', async () => {
      const expiredReservations = [
        new SeatReservation({
          id: 1,
          seatId: 1,
          userId: 1,
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

      const result = await service.expireReservations();

      expect(result).toEqual(
        expiredReservations.map((reservation) => ({
          seatId: reservation.seatId,
        })),
      );
      expect(reservationRepository.findExpired).toHaveBeenCalled();
      expect(reservationRepository.saveAll).toHaveBeenCalledWith(
        expiredReservations,
      );
    });
  });
});
