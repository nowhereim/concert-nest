import { HttpException, Inject, Injectable } from '@nestjs/common';
import { IUserClient } from './user.client.interface';

@Injectable()
export class UserFacadeApp {
  constructor(
    @Inject('IUserClient')
    private readonly userClient: IUserClient,
  ) {}

  async cashCharge(args: { userId: number; amount: number }) {
    try {
      return await this.userClient.cashCharge(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }

  async cashRead(args: { userId: number }) {
    try {
      return await this.userClient.cashRead(args);
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
