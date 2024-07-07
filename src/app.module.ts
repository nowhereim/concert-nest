import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database.module';
import { ConcertModule } from './modules/concert.module';
import { PaymentModule } from './modules/payment.module';
import { QueueModule } from './modules/queue.module';
import { ReservationModule } from './modules/reservation.module';
import { UserModule } from './modules/user.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ConcertModule,
    PaymentModule,
    QueueModule,
    ReservationModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
