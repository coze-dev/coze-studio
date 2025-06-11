import {
  type ValidateErrorData,
  type WorkflowMode,
} from '@coze-workflow/base/';
import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';

export interface EncapsulateWorkflowParams {
  name: string;
  desc: string;
  json: WorkflowJSON;
  flowMode: WorkflowMode;
}

export interface EncapsulateApiService {
  /**
   * 封装流程
   * @param name
   */
  encapsulateWorkflow: (
    params: EncapsulateWorkflowParams,
  ) => Promise<{ workflowId: string } | null>;
  /**
   * 校验流程
   * @param schema
   * @returns
   */
  validateWorkflow: (json: WorkflowJSON) => Promise<ValidateErrorData[]>;
  /**
   * 获取流程数据
   * @param spaceId
   * @param workflowId
   * @returns
   */
  getWorkflow: (
    spaceId: string,
    workflowId: string,
    version?: string,
  ) => Promise<WorkflowJSON | null>;
}

export const EncapsulateApiService = Symbol('EncapsulateApiService');
