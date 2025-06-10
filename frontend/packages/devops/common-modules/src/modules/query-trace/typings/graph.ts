import { type CSpan } from './cspan';

export enum DataSourceTypeEnum {
  SpanData = 'SpanData',
  TraceId = 'TraceId',
}

export interface DataSource {
  // 取值为traceId时，组件会根据traceId查询SpanData
  type: DataSourceTypeEnum;
  spanData?: CSpan[]; // type为spanData时，特有字段
  traceId?: string; // type为traceId时，特有字段
}
