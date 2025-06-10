/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as infra from './infra';

export type Int64 = string | number;

export interface CaseDataBase {
  /** 新增时不填，更新时填写 */
  caseID?: Int64;
  name?: string;
  description?: string;
  /** json格式的输入信息 */
  input?: string;
  isDefault?: boolean;
}

export interface CaseDataDetail {
  caseBase?: CaseDataBase;
  creatorID?: string;
  createTimeInSec?: Int64;
  updateTimeInSec?: Int64;
  /** schema不兼容 */
  schemaIncompatible?: boolean;
  updater?: infra.Creator;
}
/* eslint-enable */
