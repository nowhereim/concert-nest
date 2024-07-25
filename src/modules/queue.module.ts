import { Module } from '@nestjs/common';
import { QueueFacadeApp } from 'src/application/queue/queue.facade';
import { QueueService } from 'src/domain/queue/queue.service';
import { QueueRepositoryImpl } from 'src/infrastructure/queue/queue.repository';
import { QueueController } from 'src/presentation/queue/queue.controller';
import { ActiveQueueScheduler } from 'src/presentation/queue/scheduler/active.queue.scheduler';
import { ExpireQueueScheduler } from 'src/presentation/queue/scheduler/expire.queue.scheduler';
@Module({
  imports: [],
  controllers: [QueueController],
  providers: [
    QueueService,
    QueueFacadeApp,
    {
      provide: 'IQueueRepository',
      useClass: QueueRepositoryImpl,
    },
    ActiveQueueScheduler,
    ExpireQueueScheduler,
  ],
  exports: [QueueService],
})
export class QueueModule {}
