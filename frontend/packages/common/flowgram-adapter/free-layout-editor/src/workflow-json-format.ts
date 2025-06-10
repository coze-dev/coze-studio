import {
  type WorkflowJSON,
  type WorkflowDocument,
  type WorkflowNodeJSON,
  type WorkflowNodeEntity,
} from '@flowgram.ai/free-layout-core';

/**
 * 全局的数据转换
 */
export interface WorkflowJSONFormatContribution {
  /**
   * 数据初始化时候调用
   */
  formatOnInit?: (json: WorkflowJSON, doc: WorkflowDocument) => WorkflowJSON;
  /**
   * 数据提交时候调用
   */
  formatOnSubmit?: (json: WorkflowJSON, doc: WorkflowDocument) => WorkflowJSON;
  /**
   * 转换节点初始化数据
   * @param data
   * @param 初始化的参数
   */
  formatNodeOnInit?: (
    data: WorkflowNodeJSON,
    doc: WorkflowDocument,
    isClone?: boolean,
  ) => WorkflowNodeJSON;
  /**
   * 统一转换表单提交数据
   * @param data
   */
  formatNodeOnSubmit?: (
    data: WorkflowNodeJSON,
    doc: WorkflowDocument,
    node: WorkflowNodeEntity,
  ) => WorkflowNodeJSON;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WorkflowJSONFormatContribution = Symbol(
  'WorkflowJSONFormatContribution',
);
