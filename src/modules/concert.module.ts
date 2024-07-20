import { Module } from '@nestjs/common';
import { ConcertFacadeApp } from 'src/application/concert/concert.facade';
import { ConcertService } from 'src/domain/concert/concert.service';
import { ConcertRepositoryImpl } from 'src/infrastructure/concert/concert.repository';
import { SeatRepositoryImpl } from 'src/infrastructure/concert/seat.repository';
import { ConcertController } from 'src/presentation/concert/concert.constroller';
@Module({
  imports: [],
  controllers: [ConcertController],
  providers: [
    ConcertService,
    ConcertFacadeApp,
    {
      provide: 'IConcertRepository',
      useClass: ConcertRepositoryImpl,
    },
    {
      provide: 'ISeatRepository',
      useClass: SeatRepositoryImpl,
    },
  ],
  exports: [ConcertService],
})
export class ConcertModule {}
