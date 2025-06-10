/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_ob_query_telemetry_span from './flow_devops_ob_query_telemetry_span';

export type Int64 = string | number;

export interface ListTracesData {
  spans: Array<flow_devops_ob_query_telemetry_span.Span>;
  /** 下一页的分页token，前端拉取下一页数据时回传。 */
  next_page_token: string;
  /** 是否有更多数据 */
  has_more: boolean;
}
/* eslint-enable */
