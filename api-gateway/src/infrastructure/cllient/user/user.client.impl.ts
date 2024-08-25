import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UserClientImpl {
  async cashRead(args: { userId: number }): Promise<number> {
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/user/cash/?userId=${args.userId}`,
      {
        timeout: 3000,
      },
    );
    return response.data;
  }

  async cashCharge(args: { userId: number; amount: number }): Promise<void> {
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/user/cash`,
      args,
      {
        timeout: 3000,
      },
    );
    return response.data;
  }
}
