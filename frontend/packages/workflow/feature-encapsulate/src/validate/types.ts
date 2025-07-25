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
 
import { type StandardNodeType } from '@coze-workflow/base/types';
import {
  type WorkflowJSON,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

/**
 * 封装校验结果
 */
export interface EncapsulateValidateError {
  /**
   * 错误码
   */
  code: EncapsulateValidateErrorCode;
  /**
   * 错误信息
   */
  message: string;
  /**
   * 错误来源, 如果是节点问题, 就是节点ID
   */
  source?: string;
  /**
   * 错误来源名称
   */
  sourceName?: string;
  /**
   * 来源图标
   */
  sourceIcon?: string;
}

/**
 * 校验错误码
 */
export enum EncapsulateValidateErrorCode {
  NO_START_END = '1001',
  INVALID_PORTS = '1002',
  ENCAPSULATE_LINES = '1003',
  AT_LEAST_TWO_NODES = '1005',
  INVALID_FORM = '1006',
  VALIDATE_ERROR = '1007',
  INVALID_SCHEMA = '1008',
  INVALID_LOOP_NODES = '1009',
  INVALID_SUB_CANVAS = '1010',
}

/**
 * 校验结果
 */
export interface EncapsulateValidateResult {
  /**
   * 是否有错误
   */
  hasError: () => boolean;
  /**
   * 添加错误
   */
  addError: (error: EncapsulateValidateError) => void;
  /**
   * 获取错误列表
   * @returns
   */
  getErrors: () => EncapsulateValidateError[];
  /**
   * 是否有特定code的错误
   */
  hasErrorCode: (code: EncapsulateValidateErrorCode) => boolean;
}

export const EncapsulateValidateResult = Symbol('EncapsulateValidateResult');

/**
 * 校验结果工厂
 */
export type EncapsulateValidateResultFactory = () => EncapsulateValidateResult;

export const EncapsulateValidateResultFactory = Symbol(
  'EncapsulateValidateResultFactory',
);

/**
 * 封装节点校验器
 */
export interface EncapsulateNodeValidator {
  /**
   * 节点类型
   */
  canHandle: (type: StandardNodeType) => boolean;
  /**
   * 节点校验
   */
  validate: (
    node: WorkflowNodeEntity,
    result: EncapsulateValidateResult,
  ) => void | Promise<void>;
}

export const EncapsulateNodeValidator = Symbol('EncapsulateNodeValidator');

/**
 * 所有节点级别的校验器
 */
export interface EncapsulateNodesValidator {
  /**
   * 所有节点校验
   */
  validate: (
    nodes: WorkflowNodeEntity[],
    result: EncapsulateValidateResult,
  ) => void;
  /**
   * 是否包含开始和结束节点
   */
  includeStartEnd?: boolean;
}

export const EncapsulateNodesValidator = Symbol('EncapsulateNodesValidator');

/**
 * 流程JSON校验器
 */
export interface EncapsulateWorkflowJSONValidator {
  validate: (
    json: WorkflowJSON,
    result: EncapsulateValidateResult,
  ) => void | Promise<void>;
}

export const EncapsulateWorkflowJSONValidator = Symbol(
  'EncapsulateWorkflowJSONValidator',
);

/**
 * 封装校验管理
 */
export interface EncapsulateValidateManager {
  /**
   * 获取所有节点校验器
   */
  getNodeValidators: () => EncapsulateNodeValidator[];
  /**
   * 根据节点类型获取对应的校验器
   * @param type
   * @returns
   */
  getNodeValidatorsByType: (
    type: StandardNodeType,
  ) => EncapsulateNodeValidator[];
  /**
   * 获取所有流程级别校验器
   */
  getNodesValidators: () => EncapsulateNodesValidator[];
  /**
   * 获取所有流程JSON校验器
   * @returns
   */
  getWorkflowJSONValidators: () => EncapsulateWorkflowJSONValidator[];
  /**
   * 销毁
   */
  dispose: () => void;
}

export const EncapsulateValidateManager = Symbol('EncapsulateValidateManager');

/**
 * 封装校验服务
 */
export interface EncapsulateValidateService {
  /**
   * 校验
   * @param nodes
   * @returns
   */
  validate: (nodes: WorkflowNodeEntity[]) => Promise<EncapsulateValidateResult>;
}

export const EncapsulateValidateService = Symbol('EncapsulateValidateService');
