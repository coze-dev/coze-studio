import { ViewVariableType } from '@coze-workflow/base';

import { type IFormSchema } from '../form-engine';
import { generateFieldValidator } from './generate-field-validator';
import { generateFieldComponent } from './generate-field-component';

interface GenerateFieldOptions {
  type: ViewVariableType;
  name: string;
  title?: string;
  required?: boolean;
  description?: string;
  defaultValue?: string;
  validateJsonSchema?: any;
  extra?: IFormSchema;
}

/**
 * 表单 Field Schema 计算
 */
export const generateField = (options: GenerateFieldOptions): IFormSchema => {
  const {
    type,
    name,
    title,
    required = true,
    description,
    defaultValue,
    validateJsonSchema,
    extra,
  } = options;

  return {
    name,
    title,
    description,
    required,
    ['x-decorator']: 'FieldItem',
    ['x-decorator-props']: {
      tag: ViewVariableType.LabelMap[type],
    },
    ['x-origin-type']: type as unknown as string,
    ...generateFieldValidator(options),
    // 渲染组件相关
    ...generateFieldComponent({ type, validateJsonSchema }),
    // component 也自带默认值，入参的默认值优先级更高
    defaultValue,
    ...extra,
  };
};
