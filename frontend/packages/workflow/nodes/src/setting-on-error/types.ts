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
 
import { type ViewVariableTreeNode } from '@coze-workflow/base';

/**
 * 异常处理类型
 * 1 直接中断
 * 2 返回设定内容,
 * 3 执行异常流程
 */
export enum SettingOnErrorProcessType {
  BREAK = 1,
  RETURN = 2,
  EXCEPTION = 3,
}

/**
 * 异常处理额外数据
 */
export interface SettingOnErrorExt {
  /**
   * LLM节点重试的备选模型
   */
  backupLLmParam?: {
    modelName?: string;
    modelType?: number;
    temperature?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
  };
}

interface SettingOnErrorBase {
  /**
   * 处理类型
   */
  processType?: SettingOnErrorProcessType;
  /**
   * 超时时间 毫秒
   */
  timeoutMs?: number;
  /**
   * 重试次数 0 表示不重试
   */
  retryTimes?: number;
}

/**
 * 异常处理前端结构
 */
export interface SettingOnErrorVO extends SettingOnErrorBase {
  /**
   * 是否开启异常处理
   */
  settingOnErrorIsOpen?: boolean;
  /**
   * 发生异常处理的默认值
   */
  settingOnErrorJSON?: string;

  /**
   * 其他设置
   */
  ext?: SettingOnErrorExt;
}

export type SettingOnErrorValue = SettingOnErrorVO;

/**
 * 异常处理后端结构
 */
export interface SettingOnErrorDTO extends SettingOnErrorBase {
  /**
   * 是否开启异常处理
   */
  switch: boolean;
  /**
   * 发生异常处理的默认值
   */
  dataOnErr: string;
  /**
   * 其他设置
   */
  ext?: {
    backupLLmParam?: string;
  };
}

/**
 * 有异常设置的后端节点数据
 */
export interface NodeValueWithSettingOnErrorDTO {
  inputs?: {
    settingOnError?: SettingOnErrorDTO;
    batch?: {
      batchEnable?: boolean;
    };
  };
  outputs?: ViewVariableTreeNode[];
}

/**
 * 有异常设置的前端节点数据
 */
export interface NodeValueWithSettingOnErrorVO {
  settingOnError?: SettingOnErrorVO;
}
