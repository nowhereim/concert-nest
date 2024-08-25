import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class QueueClientImpl {
  async registerQueue(args: { userId: number }): Promise<void> {
    const response = await axios.post(
      `${process.env.QUEUE_SERVICE_URL}/queue`,
      args,
      {
        timeout: 3000,
      },
    );
    return response.data;
  }

  async validToken(args: { queueId: number }): Promise<any> {
    const response = await axios.get(
      `${process.env.QUEUE_SERVICE_URL}/queue?queueId=${args.queueId}`,
      {
        timeout: 3000,
      },
    );
    return response.data;
  }
}
