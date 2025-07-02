import type { CSSProperties } from 'react';

import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import type { InputValueVO, ValueExpression } from '@coze-workflow/base';

export type NodeInputNameFormat = (params: {
  name: string;
  prefix: string;
  suffix: string;
  input: ValueExpression;
  node: WorkflowNodeEntity;
}) => string;

export interface NodeInputNameProps {
  readonly?: boolean;
  initValidate?: boolean;
  isPureText?: boolean;
  style?: CSSProperties;
  /** 同一层的变量表达式 */
  input: ValueExpression;
  /** 当前输入列表中所有输入项 */
  inputParameters: Array<InputValueVO>;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 名称自定义格式化 */
  format?: NodeInputNameFormat;
  tooltip?: string;
  isError?: boolean;
  placeholder?: string;
}
