// events/handlers/note-created.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RegisterReservationEvent } from 'src/events/reservation/producer/register-reservation.event';

@EventsHandler(RegisterReservationEvent)
export class RegisterReservationHandler
  implements IEventHandler<RegisterReservationEvent>
{
  handle(event: RegisterReservationEvent) {
    /**
     * 이벤트 핸들러 예시. 메인 로직에 영향을 주지 않는 비동기 처리 테스트를 위해 5초
     */
    try {
      setTimeout(() => {
        console.log('Event Handled:', event);
      }, 5000);
    } catch (e) {
      /**
       * TODO: 에러 핸들링
       * 이벤트 핸들러에서 에러가 발생하면 어떻게 처리할지 정의
       */
      console.log(e);
    }
  }
}
