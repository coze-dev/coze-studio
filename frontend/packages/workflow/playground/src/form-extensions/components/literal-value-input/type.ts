import { type CSSProperties } from 'react';

import { type SchemaObject } from 'ajv';
import {
  type LiteralExpression,
  type ViewVariableType,
} from '@coze-workflow/base';
import { type SelectProps } from '@coze-arch/coze-design';

export type LiteralValueType = LiteralExpression['content'] | null;
export type InputType = ViewVariableType;
export interface InputComponentRegistry {
  canHandle:
    | InputType
    | ((
        inputType: InputType,
        // 下拉框选项列表
        optionsList?: { label: string; value: string }[],
      ) => boolean);
  component: React.FC<LiteralValueInputProps>;
}
export interface LiteralValueInputProps {
  testId?: string;
  className?: string;
  defaultValue?: LiteralValueType;
  value?: LiteralValueType;
  inputType: InputType;
  readonly?: boolean;
  disabled?: boolean;
  onChange?: (value?: LiteralValueType) => void;
  onBlur?: (value?: LiteralValueType) => void;
  onFocus?: () => void;
  validateStatus?: SelectProps['validateStatus'];
  config?: {
    min?: number;
    max?: number;
    jsonSchema?: SchemaObject;
    // 下拉框选项列表，根据这个字段来判断是否需要渲染成下拉框
    optionsList?: { label: string; value: string }[];
    onRequestInputExpand?: (expand: boolean) => void;
  };
  placeholder?: string;
  style?: CSSProperties;
  componentRegistry?: InputComponentRegistry[];
}
