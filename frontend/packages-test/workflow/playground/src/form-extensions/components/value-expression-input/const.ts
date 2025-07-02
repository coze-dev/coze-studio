import { ValueExpressionType, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { type InputType } from './InputField';

/** 输入类型选项 */
export const TYPE_OPTIONS = (
  inputType: InputType,
): {
  value: ValueExpressionType;
  label: string;
  disabled?: boolean;
}[] => [
  {
    value: ValueExpressionType.REF,
    label: I18n.t('workflow_detail_node_parameter_reference'),
  },
  {
    value: ValueExpressionType.LITERAL,
    label: ViewVariableType.isFileType(inputType)
      ? I18n.t('imageflow_input_upload')
      : I18n.t('workflow_detail_node_parameter_input'),
  },
];

const EMPTY_LITERAL = {
  type: ValueExpressionType.LITERAL,
};

const EMPTY_REF = {
  type: ValueExpressionType.REF,
};

/** 各输入类型的空值 */
export const EMPTY_VALUE = {
  [ValueExpressionType.REF]: EMPTY_REF,
  [ValueExpressionType.LITERAL]: EMPTY_LITERAL,
};

/** 默认值 */
export const DEFAULT_VALUE = EMPTY_REF;

export const VARIABLE_SELECTOR_STYLE = {
  width: '100%',
  height: '100%',
};

export const SELECT_STYLE = {
  width: 115,
};

export const SELECT_POPOVER_MIN_WIDTH = 130;
