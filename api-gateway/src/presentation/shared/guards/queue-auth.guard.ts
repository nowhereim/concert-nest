import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BaseQueueAuthGuard } from './base/base-queue.guard';

@Injectable()
export class QueueAuthGuard extends BaseQueueAuthGuard {
  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
  }

  protected needActive(): boolean {
    return false;
  }
}
