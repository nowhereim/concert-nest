import { EventType } from 'src/domain/events/event.dispatcher';

export interface IEventPublisher {
  publishEvent(args: { event: any; type: EventType }): Promise<any>;
}
