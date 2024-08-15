export interface IEventPublisher {
  publishEvent(args: { event: any; type: string }): Promise<any>;
}
