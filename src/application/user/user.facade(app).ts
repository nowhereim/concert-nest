import { Injectable } from '@nestjs/common';
import { CashHistoryService } from 'src/domain/user/cash-history.service';
import { User } from 'src/domain/user/models/user';
import { UserService } from 'src/domain/user/user.service';

@Injectable()
export class UserFacadeApp {
  constructor(
    private readonly userService: UserService,
    private readonly cashHistoryService: CashHistoryService,
  ) {}

  async cashCharge(args: { userId: number; amount: number }): Promise<User> {
    const user = await this.userService.cashCharge(args);
    await this.cashHistoryService.createChargeHistory(args);
    return user;
  }

  async cashUse(args: { userId: number; amount: number }): Promise<User> {
    const user = await this.userService.cashUse(args);
    await this.cashHistoryService.createUseHistory(args);
    return user;
  }

  async cashRead(args: { userId: number }): Promise<User> {
    return await this.userService.findUser(args);
  }
}
