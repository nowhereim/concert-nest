import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from 'src/config/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...typeormConfig,
    }),
  ],
})
export class DatabaseModule {}
