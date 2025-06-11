/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum LogBizScene {
  LogBizSceneBot = 0,
  LogBizSceneProject = 1,
  LogBizSceneWorkflowAPI = 2,
}

/** 运行载体 */
export interface SceneCommonParam {
  /** 场景type */
  log_biz_scene: LogBizScene;
  /** 不同场景含义不同， */
  entity_id?: string;
}
/* eslint-enable */
