import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../base/base-entity';
import { ConcertScheduleEntity } from './concert-schedule.entity';

@Entity()
export class ConcertEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => ConcertScheduleEntity,
    (concertSchedule) => concertSchedule.concert,
    { cascade: ['insert', 'update'] },
  )
  concertSchedules: ConcertScheduleEntity[];

  constructor(args: {
    id?: number;
    name: string;
    concertSchedules?: ConcertScheduleEntity[];
    version?: number;
  }) {
    super();
    Object.assign(this, args);
  }
}
