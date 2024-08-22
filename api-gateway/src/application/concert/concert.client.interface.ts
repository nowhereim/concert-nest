export interface IConcertClient {
  findAvailableSeats(args: { concertScheduleId: number }): Promise<any>;
  findAvailableDate(args: { concertId: number }): Promise<any>;
}
