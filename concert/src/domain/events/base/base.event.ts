import { Concert } from '../../concert/models/concert';

export class BaseEvent {
  aggregateId: number; // 애그리게이트 또는 엔티티의 ID
  aggregateType?: string; // 애그리게이트의 유형 (optional)
  op: string; // 작업 유형 ('c', 'u', 'd')
  ts_ms: number; // 이벤트 발생 시간 (타임스탬프)
  before?: Concert; // 변경 전 데이터 (UPDATE, DELETE 시 사용)
  after: Concert; // 변경 후 데이터 (INSERT, UPDATE 시 사용)
  args?: object; // 이벤트 발생 시 사용된 인자
  transactionId?: string;
}
