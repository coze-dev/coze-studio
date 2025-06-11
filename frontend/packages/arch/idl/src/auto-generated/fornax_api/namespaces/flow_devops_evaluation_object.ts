/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_evaluation_entity from './flow_devops_evaluation_entity';

export type Int64 = string | number;

export enum ObjectTypeCategory {
  /** 内置评估对象类型 */
  Builtin = 1,
  /** 自定义评估对象类型 */
  Custom = 2,
}

export interface FaasCallbackObjectParams {
  psm?: string;
  cluster?: string;
  /** 单位ms */
  timeout?: Int64;
  faas_id?: string;
  agent_execute_path?: string;
  search_object_path?: string;
  http_auth_type?: flow_devops_evaluation_entity.HTTPAuthType;
  /** NeedSearchObjectMetaInfo为true的情况下，需要填写SearchObjectPath */
  need_search_object_meta_info?: boolean;
  search_object_method?: flow_devops_evaluation_entity.HTTPMethod;
  agent_execute_method?: flow_devops_evaluation_entity.HTTPMethod;
}

export interface RPCCallbackObjectParams {
  psm?: string;
  cluster?: string;
  /** 单位ms */
  timeout?: Int64;
  need_search_object_meta_info?: boolean;
}
/* eslint-enable */
