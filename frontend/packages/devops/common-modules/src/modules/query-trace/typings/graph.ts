/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
