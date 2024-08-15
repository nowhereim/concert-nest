import { Exclude } from 'class-transformer';
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn()
  @Exclude()
  public createdAt!: Date;

  @UpdateDateColumn()
  @Exclude()
  public updatedAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  public deletedAt!: Date;
}
