export interface IUserClient {
  cashCharge(args: { userId: number; amount: number }): Promise<any>;
  cashRead(args: { userId: number }): Promise<any>;
}
