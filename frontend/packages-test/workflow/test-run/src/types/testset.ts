import { type ReactNode } from 'react';

import { type CommonFieldProps } from '@coze-arch/coze-design';

export type ValidateSchemaResult = 'pending' | 'empty' | 'invalid' | 'ok';
export type TestsetEditMode = 'create' | 'edit';

export interface ArrayFieldSchema {
  type: string;
}

export type ObjectFieldSchema = {
  name: string;
  type: string;
  schema?: ArrayFieldSchema | ObjectFieldSchema;
}[];

export interface FormItemSchema {
  // 扩展为枚举
  type: string;
  name: string;
  description?: string;
  required?: boolean;
  value?: string | number | boolean;
  /** object/array复杂类型有schema定义 */
  schema?: ArrayFieldSchema | ObjectFieldSchema;
}

export interface NodeFormSchema {
  component_id: string;
  component_type: number;
  component_name: string;
  component_icon?: string;
  inputs: FormItemSchema[];
}

export interface NodeFormItem {
  (props: CommonFieldProps): ReactNode;
}
