export interface CustomReqeust extends Request {
  userInfo: {
    queueId: number;
    waitingPosition: string;
    status: string;
  };
}
