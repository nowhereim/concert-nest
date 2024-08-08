import { Injectable } from '@nestjs/common';
import { CashHistoryService } from 'src/domain/user/cash-history.service';
import { Cash } from 'src/domain/user/models/cash';
import { User } from 'src/domain/user/models/user';
import { UserService } from 'src/domain/user/user.service';

@Injectable()
export class UserFacadeApp {
  constructor(
    private readonly userService: UserService,
    private readonly cashHistoryService: CashHistoryService,
  ) {}

  async cashCharge(args: { userId: number; amount: number }): Promise<Cash> {
    const user = await this.userService.cashCharge(args);
    this.cashHistoryService.createChargeHistory(args);
    return user;
  }

  async cashUse(args: { userId: number; amount: number }): Promise<User> {
    const user = await this.userService.cashUse(args);
    this.cashHistoryService.createUseHistory(args);
    return user;
  }

  async cashRead(args: { userId: number }): Promise<User> {
    return await this.userService.findUser(args);
  }
}
