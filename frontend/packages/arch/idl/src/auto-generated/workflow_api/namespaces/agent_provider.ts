/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface WorkflowProjectInfo {
  workflow_id: Int64;
  project_id?: Int64;
  project_version?: string;
  ext?: Record<string, string>;
}
/* eslint-enable */
