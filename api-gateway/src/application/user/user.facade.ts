import { Inject, Injectable } from '@nestjs/common';
import { IUserClient } from './user.client.interface';

@Injectable()
export class UserFacadeApp {
  constructor(
    @Inject('IUserClient')
    private readonly userClient: IUserClient,
  ) {}

  async cashCharge(args: { userId: number; amount: number }) {
    return await this.userClient.cashCharge(args);
  }

  async cashRead(args: { userId: number }) {
    return await this.userClient.cashRead(args);
  }
}
