export interface IQueueClient {
  registerQueue(args: { userId: number }): Promise<any>;
  validToken(args: { queueId: number }): Promise<any>;
}
