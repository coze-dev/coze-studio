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
 * exception handling type
 * 1 Direct interruption
 * 2 Return to the setting content,
 * 3 Execute abnormal flow
 */
export enum SettingOnErrorProcessType {
  BREAK = 1,
  RETURN = 2,
  EXCEPTION = 3,
}

/**
 * Exception handling extra data
 */
export interface SettingOnErrorExt {
  /**
   * Alternative Model for LLM Node Retry
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
   * processing type
   */
  processType?: SettingOnErrorProcessType;
  /**
   * Timeout, milliseconds
   */
  timeoutMs?: number;
  /**
   * Number of retries 0 means no retries
   */
  retryTimes?: number;
}

/**
 * Exception handling front-end architecture
 */
export interface SettingOnErrorVO extends SettingOnErrorBase {
  /**
   * Whether to enable exception handling
   */
  settingOnErrorIsOpen?: boolean;
  /**
   * Default value for exception handling to occur
   */
  settingOnErrorJSON?: string;

  /**
   * Other settings
   */
  ext?: SettingOnErrorExt;
}

export type SettingOnErrorValue = SettingOnErrorVO;

/**
 * exception handling backend structure
 */
export interface SettingOnErrorDTO extends SettingOnErrorBase {
  /**
   * Whether to enable exception handling
   */
  switch: boolean;
  /**
   * Default value for exception handling to occur
   */
  dataOnErr: string;
  /**
   * Other settings
   */
  ext?: {
    backupLLmParam?: string;
  };
}

/**
 * Backend node data with abnormal settings
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
 * Front-end node data with exception settings
 */
export interface NodeValueWithSettingOnErrorVO {
  settingOnError?: SettingOnErrorVO;
}
