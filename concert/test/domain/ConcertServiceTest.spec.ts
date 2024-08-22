import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConcertService } from 'src/domain/concert/concert.service';
import { IConcertRepository } from 'src/domain/concert/interface/i.concert.repository';
import { Concert } from 'src/domain/concert/models/concert';
import { ConcertSchedule } from 'src/domain/concert/models/concert-schedule';
import { Seat } from 'src/domain/concert/models/seat';

describe('ConcertService Unit Test', () => {
  let service: ConcertService;
  let concertRepository: jest.Mocked<IConcertRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertService,
        {
          provide: 'IConcertRepository',
          useValue: {
            findByConcertId: jest.fn(),
            findByConcertScheduleId: jest.fn(),
            findBySeatId: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'ISeatRepository',
          useValue: {
            updateIsActiveWithOptimisticLock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConcertService>(ConcertService);
    concertRepository = module.get('IConcertRepository');
  });

  describe('findAvailableDate', () => {
    it('예약 가능한 날짜가 있는 콘서트를 반환해야 함', async () => {
      const mockConcert = new Concert({
        id: 1,
        name: 'Concert 1',
        concertSchedules: [
          new ConcertSchedule({
            id: 1,
            totalSeats: 100,
            reservedSeats: 50,
            openAt: new Date('2023-01-01'),
            closeAt: new Date('2025-12-31'),
            bookingStartAt: new Date('2023-01-01'),
            bookingEndAt: new Date('2025-12-31'),
            seats: [
              new Seat({ id: 1, seatNumber: 1, isActive: true, price: 100 }),
            ],
          }),
        ],
      });

      concertRepository.findByConcertId.mockResolvedValue(mockConcert);

      const result = await service.findAvailableDate({ concertId: 1 });

      expect(result).toBe(mockConcert);
      expect(concertRepository.findByConcertId).toHaveBeenCalledWith({
        concertId: 1,
      });
    });

    it('예약 가능한 콘서트가 없을 경우 NotFoundException을 던져야 함', async () => {
      concertRepository.findByConcertId.mockResolvedValue(null);

      await expect(service.findAvailableDate({ concertId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAvailableSeat', () => {
    it('예약 가능한 좌석이 있는 콘서트를 반환해야 함', async () => {
      const mockConcert = new Concert({
        id: 1,
        name: 'Concert 1',
        concertSchedules: [
          new ConcertSchedule({
            id: 1,
            totalSeats: 100,
            reservedSeats: 50,
            openAt: new Date('2023-01-01'),
            closeAt: new Date('2025-12-31'),
            bookingStartAt: new Date('2023-01-01'),
            bookingEndAt: new Date('2025-12-31'),
            seats: [
              new Seat({ id: 1, seatNumber: 1, isActive: true, price: 100 }),
            ],
          }),
        ],
      });

      concertRepository.findByConcertScheduleId.mockResolvedValue(mockConcert);

      const result = await service.findAvailableSeat({ concertScheduleId: 1 });

      expect(result).toBe(mockConcert);
      expect(concertRepository.findByConcertScheduleId).toHaveBeenCalledWith({
        concertScheduleId: 1,
      });
    });

    it('예약 가능한 좌석이 없을 경우 NotFoundException을 던져야 함', async () => {
      concertRepository.findByConcertScheduleId.mockResolvedValue(null);

      await expect(
        service.findAvailableSeat({ concertScheduleId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findConcertInfoBySeatId', () => {
    it('좌석 ID로 콘서트 정보를 반환해야 함', async () => {
      const mockConcert = new Concert({
        id: 1,
        name: 'Concert 1',
        concertSchedules: [
          new ConcertSchedule({
            id: 1,
            totalSeats: 100,
            reservedSeats: 50,
            openAt: new Date('2023-01-01'),
            closeAt: new Date('2025-12-31'),
            bookingStartAt: new Date('2023-01-01'),
            bookingEndAt: new Date('2025-12-31'),
            seats: [
              new Seat({ id: 1, seatNumber: 1, isActive: true, price: 100 }),
            ],
          }),
        ],
      });

      concertRepository.findByConcertId.mockResolvedValue(mockConcert);

      const result = await service.findConcertInfoBySeatId({
        concertId: 1,
        seatId: 1,
      });

      expect(result).toEqual({
        id: 1,
        name: 'Concert 1',
        concertSchedule: mockConcert.concertSchedules[0],
        seat: mockConcert.concertSchedules[0].seats[0],
      });
      expect(concertRepository.findByConcertId).toHaveBeenCalledWith({
        concertId: 1,
      });
    });

    it('콘서트가 없을 경우 NotFoundException을 던져야 함', async () => {
      concertRepository.findByConcertId.mockResolvedValue(null);

      await expect(
        service.findConcertInfoBySeatId({ concertId: 1, seatId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('seatReservation', () => {
    it('좌석을 예약해야 함', async () => {
      const mockConcert = new Concert({
        id: 1,
        name: 'Concert 1',
        concertSchedules: [
          new ConcertSchedule({
            id: 1,
            totalSeats: 100,
            reservedSeats: 50,
            openAt: new Date('2023-01-01'),
            closeAt: new Date('2025-12-31'),
            bookingStartAt: new Date('2023-01-01'),
            bookingEndAt: new Date('2025-12-31'),
            seats: [
              new Seat({ id: 1, seatNumber: 1, isActive: true, price: 100 }),
            ],
          }),
        ],
      });

      concertRepository.findByConcertId.mockResolvedValue(mockConcert);
      concertRepository.save.mockResolvedValue(mockConcert);
      const result = await service.seatDeactivate({
        concertId: 1,
        seatId: 1,
        transactionId: 'test',
      });

      expect(result).toEqual({ affected: 1, raw: [], generatedMaps: [] });
      expect(concertRepository.findByConcertId).toHaveBeenCalledWith({
        concertId: 1,
      });
    });

    it('콘서트가 없을 경우 NotFoundException을 던져야 함', async () => {
      concertRepository.findByConcertId.mockResolvedValue(null);

      await expect(
        service.seatDeactivate({
          concertId: 1,
          seatId: 1,
          transactionId: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('seatActivate', () => {
    it('좌석을 활성화해야 함', async () => {
      const mockConcert = new Concert({
        id: 1,
        name: 'Concert 1',
        concertSchedules: [
          new ConcertSchedule({
            id: 1,
            totalSeats: 100,
            reservedSeats: 50,
            openAt: new Date('2023-01-01'),
            closeAt: new Date('2025-12-31'),
            bookingStartAt: new Date('2023-01-01'),
            bookingEndAt: new Date('2025-12-31'),
            seats: [
              new Seat({ id: 1, seatNumber: 1, isActive: false, price: 100 }),
            ],
          }),
        ],
      });

      concertRepository.findByConcertId.mockResolvedValue(mockConcert);
      concertRepository.save.mockResolvedValue(mockConcert);

      const result = await service.seatDeactivate({
        concertId: 1,
        seatId: 1,
        transactionId: 'test',
      });

      expect(result).toBe(mockConcert);
      expect(concertRepository.findByConcertId).toHaveBeenCalledWith({
        concertId: 1,
      });
      expect(concertRepository.save).toHaveBeenCalledWith(mockConcert);
    });

    it('콘서트가 없을 경우 NotFoundException을 던져야 함', async () => {
      concertRepository.findByConcertId.mockResolvedValue(null);

      await expect(
        service.seatDeactivate({
          concertId: 1,
          seatId: 1,
          transactionId: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('seatsActivate', () => {
    it('여러 좌석을 활성화해야 함', async () => {
      const mockConcert = new Concert({
        id: 1,
        name: 'Concert 1',
        concertSchedules: [
          new ConcertSchedule({
            id: 1,
            totalSeats: 100,
            reservedSeats: 50,
            openAt: new Date('2023-01-01'),
            closeAt: new Date('2025-12-31'),
            bookingStartAt: new Date('2023-01-01'),
            bookingEndAt: new Date('2025-12-31'),
            seats: [
              new Seat({ id: 2, seatNumber: 2, isActive: false, price: 100 }),
              new Seat({ id: 3, seatNumber: 3, isActive: false, price: 100 }),
            ],
          }),
        ],
      });
      concertRepository.findBySeatId.mockResolvedValue(mockConcert);
      concertRepository.findByConcertId.mockResolvedValue(mockConcert);

      await service.seatsActivate({
        reservation: [
          { seatId: 2, concertId: 1 },
          { seatId: 3, concertId: 1 },
        ],
      });

      expect(concertRepository.save).toHaveBeenCalledTimes(2);
      expect(concertRepository.findByConcertId).toHaveBeenCalledTimes(2);
    });
  });
});
