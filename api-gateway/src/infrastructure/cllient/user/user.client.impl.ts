import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UserClientImpl {
  async cashRead(args: { userId: number }): Promise<number> {
    try {
      const response = await axios.get(
        `${process.env.USER_SERVICE_URL}/user/cash/?userId=${args.userId}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }

  async cashCharge(args: { userId: number; amount: number }): Promise<void> {
    try {
      const response = await axios.post(
        `${process.env.USER_SERVICE_URL}/user/cash`,
        args,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
