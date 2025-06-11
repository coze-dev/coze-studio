import type { CSSProperties } from 'react';

import type { InputValueVO, RefExpression } from '@coze-workflow/base';
import { type InputProps } from '@coze/coze-design';

import { type ComponentProps } from '@/nodes-v2/components/types';

export type NodeInputNameFormat = (params: {
  name: string;
  prefix: string;
  suffix: string;
  input: RefExpression;
  // context: SetterOrDecoratorContext;
}) => string;

export type NodeInputNameProps = Omit<
  ComponentProps<string>,
  'inputParameters'
> & {
  readonly?: boolean;
  initValidate?: boolean;
  isPureText?: boolean;
  style?: CSSProperties;
  /** 同一层的变量表达式 */
  input: RefExpression;
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
  inputPrefix?: InputProps['prefix'];
  disabled?: boolean;
};
