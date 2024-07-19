import { UpdateResult } from 'typeorm';
import { Concert } from './models/concert';

export interface ISeatRepository {
  save(args: any, transactionalEntityManager?: any): Promise<any>;
  updateIsActiveWithOptimisticLock(
    args: { concert: Concert; seatId: number },
    transactionalEntityManager?: any,
  ): Promise<UpdateResult>;
}
