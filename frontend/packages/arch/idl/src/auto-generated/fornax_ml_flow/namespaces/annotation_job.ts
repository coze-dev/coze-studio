/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_prompt_common from './flow_devops_prompt_common';

export type Int64 = string | number;

export interface Annotator {
  /** 类型: 手工manual、关联associated */
  category?: string;
  /** 手工配置 */
  manualAnnotator?: ManualAnnotator;
}

export interface InputMapping {
  /** 输入类型: 固定值fixed、关联字段use_column、之前输入former_model_input、之前输出former_model_output */
  sourceType?: string;
  /** 输入值 */
  sourceValue?: string;
  /** 输出类型: prompt变量名prompt_var_name */
  targetType?: string;
  /** 输出值 */
  targetValue?: string;
}

export interface ManualAnnotator {
  /** 模型配置 */
  model?: flow_devops_prompt_common.ModelConfig;
  /** prompt类型：手工manual、关联associated */
  promptCategory?: string;
  /** 手工填入的数据内容 */
  promptContent?: string;
  /** 关联时 */
  promptID?: string;
  /** 关联时 */
  promptVersion?: string;
  userPromptColumnName?: string;
  /** 输入映射 */
  inputMappings?: Array<InputMapping>;
  /** 输出映射 */
  outputMappings?: Array<OutputMapping>;
}

export interface OutputMapping {
  /** 输入类型: plain、json_path */
  sourceType?: string;
  /** 输入值 */
  sourceValue?: string;
  /** 输出类型: use_column、plain */
  targetType?: string;
  /** 输出值 */
  targetValue?: string;
}

export interface PassKTask {
  /** 推理模型配置 */
  reasoner?: Annotator;
  /** 推理次数 */
  inferenceRound?: number;
  /** 评估器配置 */
  judge?: Annotator;
  /** 正确阈值 */
  positiveThreshold?: number;
}

export interface QualityScoreJob {
  /** 唯一ID，创建时不传 */
  id?: string;
  /** appID，创建时不传 */
  appID?: number;
  /** 空间ID，创建时不传 */
  spaceID?: string;
  /** 数据集ID，创建时不传 */
  datasetID?: string;
  /** 版本号，创建时不传 */
  version?: string;
  /** job ID，创建时不传 */
  jobID?: string;
  /** 任务名字, 可不传 */
  name?: string;
  /** 任务状态: active、inactive */
  status?: string;
  /** 标注任务类型: passk */
  category?: string;
  /** passKTask 任务内容 */
  passKTask?: PassKTask;
  /** 是否自动计算新增数据 */
  autoCalculateNewData?: boolean;
  /** 通用信息 */
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface QualityScoreJobInstance {
  /** instance唯一id */
  id?: string;
  /** 任务ID */
  jobID?: string;
  /** 总条数 */
  total?: number;
  /** 成功条数 */
  successCnt?: number;
  /** 失败条数 */
  failedCnt?: number;
  /** 任务状态 */
  status?: string;
}
/* eslint-enable */
