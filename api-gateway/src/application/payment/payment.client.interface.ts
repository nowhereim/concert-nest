export interface IPaymentClient {
  pay(args: { userId: number; seatId: number }): Promise<any>;
}
