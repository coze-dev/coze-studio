/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_eino_app_canvas from './flow_devops_eino_app_canvas';
import * as flow_devops_eino_app_debug from './flow_devops_eino_app_debug';

export type Int64 = string | number;

export interface ComponentItem {
  /** 列表项名称 */
  name?: string;
  /** 如果该项是一个组件，则为非空 */
  component_schema?: flow_devops_eino_app_canvas.ComponentSchema;
  /** 嵌套组件列表 */
  children?: Array<ComponentItem>;
  can_orchestrate?: boolean;
}

export interface CreateDebugThreadData {
  thread_id?: string;
}

export interface CreateDebugThreadReq {
  graph_id: string;
}

export interface CreateDebugThreadResp {
  code: Int64;
  msg: string;
  data?: CreateDebugThreadData;
}

export interface DisplayReq {
  drange?: string;
  var_name?: string;
  func_name?: string;
}

export interface DisplayResp {
  code?: Int64;
  msg?: string;
  data?: GraphSchemaData;
}

export interface GenCodeResultData {
  gen_path?: string;
  fdl_schema?: string;
}

export interface GetCanvasInfoData {
  canvas_info?: flow_devops_eino_app_canvas.CanvasInfo;
}

export interface GetCanvasInfoReq {
  graph_id: string;
}

export interface GetCanvasInfoResp {
  code: Int64;
  msg: string;
  data?: GetCanvasInfoData;
}

export interface GetGenCodePathReq {}

export interface GetGenCodePathResp {
  selected_path?: string;
}

export interface GraphGenCodeReq {
  gen_path?: string;
  overwrite?: boolean;
  fdl_schema?: string;
}

export interface GraphGenCodeResp {
  code?: Int64;
  msg?: string;
  data?: GenCodeResultData;
}

export interface GraphMeta {
  id?: string;
  name?: string;
}

export interface GraphSchemaData {
  canvas_info?: flow_devops_eino_app_canvas.CanvasInfo;
}

export interface ListComponentsData {
  /** 官方组件 */
  official_components?: Array<ComponentItem>;
  /** 自定义组件 */
  custom_components?: Array<ComponentItem>;
}

export interface ListComponentsRequest {}

export interface ListComponentsResp {
  code: number;
  msg: string;
  data?: ListComponentsData;
}

export interface ListGraphData {
  graphs?: Array<GraphMeta>;
}

export interface ListGraphReq {}

export interface ListGraphResp {
  data?: ListGraphData;
  code: Int64;
  msg: string;
}

export interface ListInputTypesData {
  types?: Array<flow_devops_eino_app_canvas.JsonSchema>;
}

export interface ListInputTypesReq {}

export interface ListInputTypesResp {
  code?: Int64;
  msg?: string;
  data?: ListInputTypesData;
}

export interface PingReq {}

export interface PingResp {
  data: string;
  code: Int64;
  msg: string;
}

export interface StreamDebugRunReq {
  graph_id: string;
  thread_id: string;
  from_node?: string;
  input?: string;
  log_id?: string;
}

export interface StreamDebugRunResp {
  type: string;
  debug_id: string;
  error?: string;
  content?: flow_devops_eino_app_debug.NodeDebugState;
}

export interface StreamLogReq {}
/* eslint-enable */
