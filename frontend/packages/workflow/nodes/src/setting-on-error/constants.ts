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
 
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { StandardNodeType } from '@coze-workflow/base';

/**
 * 使用 V2 版本异常设置的节点
 */
export const SETTING_ON_ERROR_V2_NODES = [
  StandardNodeType.Code,
  StandardNodeType.LLM,
  StandardNodeType.Api,
  StandardNodeType.Database,
  StandardNodeType.ImageGenerate,
  StandardNodeType.DatabaseCreate,
  StandardNodeType.DatabaseUpdate,
  StandardNodeType.DatabaseQuery,
  StandardNodeType.DatabaseDelete,
  StandardNodeType.ImageCanvas,
  StandardNodeType.Intent,
];

/**
 * 使用V1的版本异常设置
 */
export const SETTING_ON_ERROR_V1_NODES = [StandardNodeType.Http];

/**
 * 有动态port的节点
 */
export const SETTING_ON_ERROR_DYNAMIC_PORT_NODES = [StandardNodeType.Intent];

/**
 * 开启异常的节点
 */
export const SETTING_ON_ERROR_NODES = [
  ...SETTING_ON_ERROR_V1_NODES,
  ...SETTING_ON_ERROR_V2_NODES,
];

/**
 * 异常端口
 */
export const SETTING_ON_ERROR_PORT = 'branch_error';

/**
 * 超时最小100ms；
 */
export const SETTING_ON_ERROR_MIN_TIMEOUT = 100;

/**
 * 其他节点：默认1分钟，最大1分钟；
 */
export const SETTING_ON_ERROR_DEFAULT_TIMEOUT = {
  default: 60 * 1000,
  max: 60 * 1000,
};

/**
 * 节点配置
 * LLM：默认3分钟，最大10分钟；
 * 插件：默认3分钟，最大3分钟；
 */
export const SETTING_ON_ERROR_NODES_CONFIG = {
  [StandardNodeType.LLM]: {
    timeout: {
      default: 3 * 60 * 1000,
      max: 10 * 60 * 1000,
      init: 10 * 60 * 1000,
    },
    enableBackupModel: true,
  },
  [StandardNodeType.Api]: {
    timeout: {
      default: 3 * 60 * 1000,
      max: 3 * 60 * 1000,
    },
  },
};

export const ERROR_BODY_NAME = 'errorBody';
export const IS_SUCCESS_NAME = 'isSuccess';
