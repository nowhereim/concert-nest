export interface CustomReqeust extends Request {
  userInfo: {
    userId: string;
    queueId: string;
    queueStatus: string;
  };
}
