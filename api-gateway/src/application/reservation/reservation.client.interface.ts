export interface IReservationClient {
  registerReservation(args: {
    userId: number;
    seatId: number;
    concertId: number;
  }): Promise<any>;
}
