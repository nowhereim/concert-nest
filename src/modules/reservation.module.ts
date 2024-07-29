import { Module } from '@nestjs/common';
import { ReservationFacadeApp } from 'src/application/reservation/reservation.facade';
import { ReservationService } from 'src/domain/reservation/reservation.service';
import { ReservationRepositoryImpl } from 'src/infrastructure/reservation/reservation.repository';
import { ReservationController } from 'src/presentation/reservation/reservation.controller';
import { ConcertModule } from './concert.module';
import { ReservationScheduler } from 'src/presentation/reservation/scheduler/expire.reservation.scheduler';
import { KafkaModule } from './kafka.module';
import { RabbitMQModule } from './rabbitmq.module';
import { RedisModule } from './redis.module';
@Module({
  imports: [ConcertModule, KafkaModule, RabbitMQModule, RedisModule],
  controllers: [ReservationController],
  providers: [
    ReservationScheduler,
    ReservationService,
    ReservationFacadeApp,
    {
      provide: 'IReservationRepository',
      useClass: ReservationRepositoryImpl,
    },
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
