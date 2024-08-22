import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class QueueClientImpl {
  async registerQueue(args: { userId: number }): Promise<void> {
    const response = await axios.post('http://localhost:8083/queue', args);
    return response.data;
  }

  async validToken(args: { queueId: number }): Promise<void> {
    try {
      const { data } = await axios.get(
        `${process.env.QUEUE_SERVICE_URL}/queue?queueId=${args.queueId}`,
      );
      return data;
    } catch (error) {
      throw new HttpException(error.response.data.error, error.response.status);
    }
  }
}
