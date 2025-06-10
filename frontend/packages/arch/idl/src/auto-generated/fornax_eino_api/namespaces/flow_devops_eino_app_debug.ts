/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface NodeDebugMetrics {
  prompt_tokens?: Int64;
  completion_tokens?: Int64;
  invoke_time_ms?: Int64;
  completion_time_ms?: Int64;
}

export interface NodeDebugState {
  node_key: string;
  input?: string;
  output?: string;
  error?: string;
  error_type?: string;
  metrics?: NodeDebugMetrics;
}
/* eslint-enable */
