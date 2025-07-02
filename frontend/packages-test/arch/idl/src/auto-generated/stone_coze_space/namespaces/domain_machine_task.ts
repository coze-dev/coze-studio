/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum DomainMachineFileSource {
  UploadByUser = 1,
  FinalOutput = 2,
  IntermidiateOutput = 3,
}

export enum DomainStockTaskType {
  /** 普通咨询任务 */
  GeneralChat = 1,
  /** 定时任务 */
  Scheduled = 2,
}

export enum DomainTaskStatus {
  Delete = 0,
  Running = 1,
  Paused = 2,
  Finished = 3,
  Init = 4,
  Terminated = 5,
  Interrupted = 6,
  /** 存在非法内容 */
  IllegalContent = 7,
  /** 异常中断 */
  AbnormalInterrupted = 8,
}

export enum DomainTaskType {
  General = 1,
  UserResearch = 2,
  Stock = 3,
}

export enum MachineTaskFileStatus {
  Using = 1,
  Deleted = 2,
}
/* eslint-enable */
