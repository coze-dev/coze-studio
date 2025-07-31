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

import { type UseBoundStoreWithEqualityFn } from 'zustand/traditional';
import { type StoreApi } from 'zustand';
import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

export const ValidationService = Symbol('ValidationService');

export const useValidationService = () =>
  useService<ValidationService>(ValidationService);
export const useValidationServiceStore = <T>(
  selector: (s: ValidationState) => T,
) => useValidationService().store(selector);

export interface ValidateError {
  // error description
  errorInfo: string;
  // error level
  errorLevel: FeedbackStatus;
  // Error Type: Node/Connection
  errorType: 'node' | 'line';
  // Node ID
  nodeId: string;
  // In the case of a connection error, the target node is also required to confirm the connection
  targetNodeId?: string;
}
export interface WorkflowValidateError {
  workflowId: string;
  /** process name */
  name?: string;
  errors: ValidateErrorMap;
}

export type ValidateErrorMap = Record<string, ValidateError[]>;
export type WorkflowValidateErrorMap = Record<string, WorkflowValidateError>;

export interface ValidateResult {
  hasError: boolean;
  nodeErrorMap: ValidateErrorMap;
}
export interface ValidateResultV2 {
  hasError: boolean;
  errors: WorkflowValidateErrorMap;
}

export interface ValidationState {
  /**
   * @deprecated Please use errorsV2
   */
  errors: ValidateErrorMap;
  /** Errors classified by process attribution */
  errorsV2: WorkflowValidateErrorMap;
  /** Verifying now. */
  validating: boolean;
}

export interface ValidationService {
  store: UseBoundStoreWithEqualityFn<StoreApi<ValidationState>>;

  /**
   * Front-end process validation, including nodes, forms, ports, etc
   */
  validateWorkflow: () => Promise<ValidateResult>;

  /**
   * Verification of nodes, including forms, ports, etc
   */
  validateNode: (node: WorkflowNodeEntity) => Promise<ValidateResult>;

  /**
   * @Deprecated please use validateSchemaV2
   * Process definition validation, usually backend validation
   */
  validateSchema: () => Promise<ValidateResult>;
  /**
   * Process definition validation, usually backend validation
   */
  validateSchemaV2: () => Promise<ValidateResultV2>;

  /**
   * Gets the error list for the specified id
   */
  getErrors: (id: string) => ValidateError[];
  /**
   * @deprecated Please use setErrorsV2
   * setting error
   * @param errors
   * @param force to overwrite all errors
   */
  setErrors: (errors: ValidationState['errors'], force?: boolean) => void;

  /**
   * setting error
   * @param errors
   * @returns
   */
  setErrorsV2: (errors: ValidationState['errorsV2']) => void;
  /**
   * Clear all errors
   */
  clearErrors: () => void;
  /** Is there an error in the line? */
  isLineError: (fromId: string, toId?: string) => boolean;

  get validating(): boolean;
  set validating(value: boolean);
}
