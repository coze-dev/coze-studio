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
 * Encapsulation check result
 */
export interface EncapsulateValidateError {
  /**
   * error code
   */
  code: EncapsulateValidateErrorCode;
  /**
   * error message
   */
  message: string;
  /**
   * The source of the error, if it is a node problem, is the node ID.
   */
  source?: string;
  /**
   * Error source name
   */
  sourceName?: string;
  /**
   * source icon
   */
  sourceIcon?: string;
}

/**
 * check error code
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
 * verification result
 */
export interface EncapsulateValidateResult {
  /**
   * Is there an error?
   */
  hasError: () => boolean;
  /**
   * add error
   */
  addError: (error: EncapsulateValidateError) => void;
  /**
   * Get error list
   * @returns
   */
  getErrors: () => EncapsulateValidateError[];
  /**
   * Is there a specific code error?
   */
  hasErrorCode: (code: EncapsulateValidateErrorCode) => boolean;
}

export const EncapsulateValidateResult = Symbol('EncapsulateValidateResult');

/**
 * Validation Result Factory
 */
export type EncapsulateValidateResultFactory = () => EncapsulateValidateResult;

export const EncapsulateValidateResultFactory = Symbol(
  'EncapsulateValidateResultFactory',
);

/**
 * Encapsulated Node Verifier
 */
export interface EncapsulateNodeValidator {
  /**
   * Node type
   */
  canHandle: (type: StandardNodeType) => boolean;
  /**
   * node validation
   */
  validate: (
    node: WorkflowNodeEntity,
    result: EncapsulateValidateResult,
  ) => void | Promise<void>;
}

export const EncapsulateNodeValidator = Symbol('EncapsulateNodeValidator');

/**
 * Validators for all node levels
 */
export interface EncapsulateNodesValidator {
  /**
   * validate all nodes
   */
  validate: (
    nodes: WorkflowNodeEntity[],
    result: EncapsulateValidateResult,
  ) => void;
  /**
   * Whether to include start and end nodes
   */
  includeStartEnd?: boolean;
}

export const EncapsulateNodesValidator = Symbol('EncapsulateNodesValidator');

/**
 * Process JSON validator
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
 * Encapsulation Validation Management
 */
export interface EncapsulateValidateManager {
  /**
   * Get all node validators
   */
  getNodeValidators: () => EncapsulateNodeValidator[];
  /**
   * Get the corresponding validator according to the node type
   * @param type
   * @returns
   */
  getNodeValidatorsByType: (
    type: StandardNodeType,
  ) => EncapsulateNodeValidator[];
  /**
   * Get all process level validators
   */
  getNodesValidators: () => EncapsulateNodesValidator[];
  /**
   * Get all process JSON validators
   * @returns
   */
  getWorkflowJSONValidators: () => EncapsulateWorkflowJSONValidator[];
  /**
   * destroy
   */
  dispose: () => void;
}

export const EncapsulateValidateManager = Symbol('EncapsulateValidateManager');

/**
 * Encapsulation Validation Service
 */
export interface EncapsulateValidateService {
  /**
   * validation
   * @param nodes
   * @returns
   */
  validate: (nodes: WorkflowNodeEntity[]) => Promise<EncapsulateValidateResult>;
}

export const EncapsulateValidateService = Symbol('EncapsulateValidateService');
