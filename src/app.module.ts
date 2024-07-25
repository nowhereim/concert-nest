import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database.module';
import { ConcertModule } from './modules/concert.module';
import { PaymentModule } from './modules/payment.module';
import { QueueModule } from './modules/queue.module';
import { ReservationModule } from './modules/reservation.module';
import { UserModule } from './modules/user.module';
import { SeederService } from './seed/seeder.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerMiddleware } from './presentation/shared/middleware/http-log.middleware';
import { CustomLogger } from './common/logger/logger';
import { RedisModule } from './modules/redis.module';
import { KafkaModule } from './modules/kafka.module';
import { RabbitMQModule } from './modules/rabbitmq.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    DatabaseModule,
    ConcertModule,
    PaymentModule,
    QueueModule,
    ReservationModule,
    UserModule,
    RedisModule,
    KafkaModule,
    RabbitMQModule,
  ],
  controllers: [],
  providers: [SeederService, CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
