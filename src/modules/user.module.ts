import { Module } from '@nestjs/common';
import { UserFacadeApp } from 'src/application/user/user.facade(app)';
import { CashHistoryService } from 'src/domain/user/cash-history.service';
import { UserService } from 'src/domain/user/user.service';
import { CashHistoryRepositoryImpl } from 'src/infrastructure/user/cash-history.repository';
import { UserRepositoryImpl } from 'src/infrastructure/user/user.respository';
import { UserController } from 'src/presentation/user/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserFacadeApp,
    UserService,
    CashHistoryService,
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
    {
      provide: 'ICashHistoryRepository',
      useClass: CashHistoryRepositoryImpl,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
