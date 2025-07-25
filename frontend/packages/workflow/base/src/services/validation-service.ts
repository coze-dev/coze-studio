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
  // 错误描述
  errorInfo: string;
  // 错误等级
  errorLevel: FeedbackStatus;
  // 错误类型： 节点 / 连线
  errorType: 'node' | 'line';
  // 节点id
  nodeId: string;
  // 若为连线错误，还需要目标节点来确认这条连线
  targetNodeId?: string;
}
export interface WorkflowValidateError {
  workflowId: string;
  /** 流程名 */
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
   * @deprecated 请使用 errorsV2
   */
  errors: ValidateErrorMap;
  /** 按照流程归属分类的错误 */
  errorsV2: WorkflowValidateErrorMap;
  /** 正在校验中 */
  validating: boolean;
}

export interface ValidationService {
  store: UseBoundStoreWithEqualityFn<StoreApi<ValidationState>>;

  /**
   * 前端流程校验，包括节点、表单、端口等
   */
  validateWorkflow: () => Promise<ValidateResult>;

  /**
   * 对节点的校验，包括表单、端口等
   */
  validateNode: (node: WorkflowNodeEntity) => Promise<ValidateResult>;

  /**
   * @deprecated 请使用 validateSchemaV2
   * 流程定义合法性校验，通常为后端校验
   */
  validateSchema: () => Promise<ValidateResult>;
  /**
   * 流程定义合法性校验，通常为后端校验
   */
  validateSchemaV2: () => Promise<ValidateResultV2>;

  /**
   * 获取指定 id 的错误列表
   */
  getErrors: (id: string) => ValidateError[];
  /**
   * @deprecated 请使用 setErrorsV2
   * 设置错误
   * @param errors
   * @param force 强制覆盖所有错误
   */
  setErrors: (errors: ValidationState['errors'], force?: boolean) => void;

  /**
   * 设置错误
   * @param errors
   * @returns
   */
  setErrorsV2: (errors: ValidationState['errorsV2']) => void;
  /**
   * 清空所有错误
   */
  clearErrors: () => void;
  /** 线条是否存在错误 */
  isLineError: (fromId: string, toId?: string) => boolean;

  get validating(): boolean;
  set validating(value: boolean);
}
