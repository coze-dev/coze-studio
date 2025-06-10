import { type APIParameter } from '@coze-arch/bot-api/plugin_develop';

export enum STATUS {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WAIT = 'WAIT',
}
export interface CheckParamsProps {
  status?: STATUS;
  request?: string;
  response?: string;
  failReason?: string;
  response_params?: Array<APIParameter>;
  rawResp?: string;
}

export interface StepUpdateApiRes {
  code: string | number;
  msg: string;
}

export const ERROR_CODE = {
  SAFE_CHECK: 720092020,
};
