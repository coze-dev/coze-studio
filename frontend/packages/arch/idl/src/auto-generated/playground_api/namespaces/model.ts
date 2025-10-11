/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as bot_common from './bot_common';

export type Int64 = string | number;

export enum ModelClass {
  GPT = 1,
  SEED = 2,
  Claude = 3,
  /** name: MiniMax */
  MiniMax = 4,
  Plugin = 5,
  StableDiffusion = 6,
  ByteArtist = 7,
  Maas = 9,
  /** 废弃：千帆(百度云) */
  QianFan = 10,
  /** name：Google Gemini */
  Gemini = 11,
  /** name: Moonshot */
  Moonshot = 12,
  /** name：智谱 */
  GLM = 13,
  /** name: 火山方舟 */
  MaaSAutoSync = 14,
  /** name：通义千问 */
  QWen = 15,
  /** name: Cohere */
  Cohere = 16,
  /** name: 百川智能 */
  Baichuan = 17,
  /** name：文心一言 */
  Ernie = 18,
  /** name: 幻方 */
  DeekSeek = 19,
  /** name: Llama */
  Llama = 20,
  StepFun = 23,
  Custom = 24,
  Other = 999,
}

export enum ModelParamType {
  Float = 1,
  Int = 2,
  Boolean = 3,
  String = 4,
}

export enum ModelTagClass {
  ModelType = 1,
  ModelUserRight = 2,
  ModelFeature = 3,
  ModelFunction = 4,
  ModelPaid = 15,
  /** 模型运行时能力 */
  ModelAbility = 16,
  /** 模型状态 */
  ModelStatus = 17,
  /** 本期不做 */
  Custom = 20,
  Others = 100,
}

export enum ModelTagValue {
  Flagship = 1,
  HighSpeed = 2,
  ToolInvocation = 3,
  RolePlaying = 4,
  LongText = 5,
  ImageUnderstanding = 6,
  Reasoning = 7,
  VideoUnderstanding = 8,
  CostPerformance = 9,
  CodeSpecialization = 10,
  AudioUnderstanding = 11,
}

export enum VideoGenType {
  /** 文生视频 */
  Text = 1,
  /** 首帧 */
  ImageFirstFrame = 2,
  /** 首尾帧 */
  ImageFirstLastFrame = 3,
  /** 参考图 */
  ReferencePicture = 4,
}

export interface Model {
  name?: string;
  model_type?: Int64;
  model_class?: ModelClass;
  /** model icon的url */
  model_icon?: string;
  model_input_price?: number;
  model_output_price?: number;
  model_quota?: ModelQuota;
  /** model真实名，前端计算token用 */
  model_name?: string;
  model_class_name?: string;
  is_offline?: boolean;
  model_params?: Array<ModelParameter>;
  model_desc?: Array<ModelDescGroup>;
  /** 模型功能配置 */
  func_config?: Record<
    bot_common.ModelFuncConfigType,
    bot_common.ModelFuncConfigStatus
  >;
  /** 方舟模型节点名称 */
  endpoint_name?: string;
  /** 模型标签 */
  model_tag_list?: Array<ModelTag>;
  /** user prompt是否必须有且不能为空 */
  is_up_required?: boolean;
  /** 模型简要描述 */
  model_brief_desc?: string;
  /** 模型系列 */
  model_series?: ModelSeriesInfo;
  /** 模型状态 */
  model_status_details?: ModelStatusDetails;
  /** 模型能力 */
  model_ability?: ModelAbility;
  model_show_family_id?: string;
  hot_flag?: number;
  hot_ranking?: number;
  online_time?: Int64;
  /** 0-用户可见 1-用户不可见 */
  config_type?: number;
  offline_time?: Int64;
  volc_account_id?: string;
  /** 秒级时间戳 */
  terminate_time?: Int64;
}

export interface ModelAbility {
  /** 是否展示cot */
  cot_display?: boolean;
  /** 是否支持function call */
  function_call?: boolean;
  /** 是否支持图片理解 */
  image_understanding?: boolean;
  /** 是否支持视频理解 */
  video_understanding?: boolean;
  /** 是否支持音频理解 */
  audio_understanding?: boolean;
  /** 是否支持多模态 */
  support_multi_modal?: boolean;
  /** 是否支持续写 */
  prefill_resp?: boolean;
  /** 是否支持视频理解 */
  video_gen?: Array<VideoGenType>;
}

export interface ModelDescGroup {
  group_name?: string;
  desc?: Array<string>;
}

export interface ModelParamClass {
  /** 1="Generation diversity", 2="Input and output length", 3="Output format" */
  class_id?: number;
  label?: string;
}

export interface ModelParamDefaultValue {
  default_val: string;
  creative?: string;
  balance?: string;
  precise?: string;
}

export interface ModelParameter {
  /** 配置字段，如max_tokens */
  name: string;
  /** 配置字段展示名称 */
  label?: string;
  /** 配置字段详情描述 */
  desc?: string;
  /** 类型 */
  type: ModelParamType;
  /** 数值类型参数，允许设置的最小值 */
  min?: string;
  /** 数值类型参数，允许设置的最大值 */
  max?: string;
  /** float类型参数的精度 */
  precision?: number;
  /** 参数默认值{"default": xx, "creative":xx} */
  default_val: ModelParamDefaultValue;
  /** 枚举值，如response_format支持text,markdown,json */
  options?: Array<Option>;
  /** 参数分类，"Generation diversity", "Input and output length", "Output format" */
  param_class?: ModelParamClass;
  custom_flag?: boolean;
}

export interface ModelQuota {
  /** 最大总 token 数量 */
  token_limit?: number;
  /** 最终回复最大 token 数量 */
  token_resp?: number;
  /** Prompt 系统最大 token 数量 */
  token_system?: number;
  /** Prompt 用户输入最大 token 数量 */
  token_user_in?: number;
  /** Prompt 工具输入最大 token 数量 */
  token_tools_in?: number;
  /** Prompt 工具输出最大 token 数量 */
  token_tools_out?: number;
  /** Prompt 数据最大 token 数量 */
  token_data?: number;
  /** Prompt 历史最大 token 数量 */
  token_history?: number;
  /** Prompt 历史最大 token 数量 */
  token_cut_switch?: boolean;
  /** 输入成本 */
  price_in?: number;
  /** 输出成本 */
  price_out?: number;
  /** systemprompt输入限制，如果没有传，对输入不做限制 */
  system_prompt_limit?: number;
}

export interface ModelSeriesInfo {
  series_name?: string;
  icon_url?: string;
  model_vendor?: string;
  model_tips?: string;
}

export interface ModelShowFamily {
  id?: Int64;
  icon?: string;
  iconUrl?: string;
  name?: string;
  ranking?: number;
}

export interface ModelStatusDetails {
  /** 是否为新模型 */
  is_new_model?: boolean;
  /** 是否是高级模型 */
  is_advanced_model?: boolean;
  /** 是否是免费模型 */
  is_free_model?: boolean;
  /** 是否即将下架 */
  is_upcoming_deprecated?: boolean;
  /** 下架日期 */
  deprecated_date?: string;
  /** 下架替换的模型 */
  replace_model_name?: string;
  /** 最近更新信息 */
  update_info?: string;
  /** 模型特色 */
  model_feature?: ModelTagValue;
}

export interface ModelTag {
  tag_name?: string;
  tag_class?: ModelTagClass;
  tag_icon?: string;
  tag_descriptions?: string;
}

export interface Option {
  /** option展示的值 */
  label?: string;
  /** 填入的值 */
  value?: string;
}
/* eslint-enable */
