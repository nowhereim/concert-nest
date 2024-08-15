import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, EntityTarget } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseEntity } from './base-entity';
@Injectable()
export abstract class Repository<T extends BaseEntity> {
  @InjectDataSource() protected dataSource!: DataSource;
  constructor(private entityManager: EntityManager) {}

  protected abstract entityClass: EntityTarget<T>;

  getManager(): EntityManager {
    return this.entityManager;
  }

  getTransactionManager(): EntityManager {
    return this.dataSource.createEntityManager();
  }
}
