import { Module } from '@nestjs/common';
import { ConcertFacadeApp } from 'src/application/concert/concert.facade(app)';
import { ConcertService } from 'src/domain/concert/concert.service';
import { ConcertRepositoryImpl } from 'src/infrastructure/concert/concert.repository';
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
  ],
  exports: [ConcertService],
})
export class ConcertModule {}
