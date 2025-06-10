/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** 回调类型 */
export enum CallbackType {
  CREATE = 1,
  DELETE = 2,
}

export enum OperateType {
  /** 运行 */
  Running = 1,
  /** 暂停 */
  Pause = 2,
  /** 一轮任务完成 */
  TaskFinish = 3,
  Stop = 5,
  /** 中断 */
  Interrupt = 6,
  /** 存在非法内容 */
  IllegalContent = 7,
  /** 异常中断 */
  AbnormalInterrupt = 8,
}

export interface UpdateTaskNameRequest {
  agent_id?: Int64;
  sk?: string;
  task_id?: string;
  task_name?: string;
}

export interface UpdateTaskNameResponse {
  code?: Int64;
  msg?: string;
}

export interface UpdateTaskStatusRequest {
  agent_id?: Int64;
  sk?: string;
  task_id?: string;
  task_status?: OperateType;
}

export interface UpdateTaskStatusResponse {
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
