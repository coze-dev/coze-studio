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
 
import {
  type WorkflowPortEntity,
  type WorkflowNodeEntity,
  type WorkflowLineEntity,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';
import { type Event } from '@flowgram-adapter/common';
import { type WorkflowVariable } from '@coze-workflow/variable';

import { type EncapsulateValidateResult } from '../validate';

/**
 * 封装结果
 */
export type EncapsulateResult =
  | EncapsulateErrorResult
  | EncapsulateSuccessResult;

/**
 * 错误结果
 */
export interface EncapsulateErrorResult {
  /**
   * 状态
   */
  success: false;
  /**
   * 消息提示
   */
  message: string;
}

/**
 * 成功结果
 */
export interface EncapsulateSuccessResult {
  /**
   * 状态
   */
  success: true;
  /**
   * 生成的节点
   */
  subFlowNode: WorkflowNodeEntity;
  /**
   * 生成的输入线
   */
  inputLines: WorkflowLineEntity[];
  /**
   * 生成的输出线
   */
  outputLines: WorkflowLineEntity[];
  /**
   * 生成的workflow id
   */
  workflowId: string;
  /**
   * projectId
   */
  projectId?: string;
}

/**
 * 封装/解封服务
 */
export interface EncapsulateService {
  /**
   * 是否可以封装
   */
  canEncapsulate: () => boolean;
  /**
   * 封装
   */
  encapsulate: () => Promise<EncapsulateResult>;
  /**
   * 是否支持解封
   */
  canDecapsulate: (node: WorkflowNodeEntity) => boolean;
  /**
   * 解封
   */
  decapsulate: (node: WorkflowNodeEntity) => Promise<void>;
  /**
   * 校验
   */
  validate: () => Promise<EncapsulateValidateResult>;
  /**
   * 封装成功回调
   */
  onEncapsulate: Event<EncapsulateResult>;
  /**
   * 销毁
   */
  dispose: () => void;
}

export const EncapsulateService = Symbol('EncapsulateService');

/**
 * 封装/解封管理
 */
export interface EncapsulateManager {
  /**
   * 初始化
   */
  init: () => void;
  /**
   * 销毁
   * @returns
   */
  dispose: () => void;
}

export const EncapsulateManager = Symbol('EncapsulateManager');

/**
 * 连接端口
 */
export interface ConnectPortsInfo {
  inputLines: WorkflowLineEntity[];
  outputLines: WorkflowLineEntity[];
  fromPorts: WorkflowPortEntity[];
  toPorts: WorkflowPortEntity[];
}

export interface DecapsulateContext {
  idsMap: Map<string, string>;
  startNode?: WorkflowNodeJSON;
  endNode?: WorkflowNodeJSON;
  middleNodes: WorkflowNodeJSON[];
}

export type VariableMap = Record<string, WorkflowVariable>;

export interface EncapsulateVars {
  startVars: VariableMap;
  endVars: VariableMap;
}
