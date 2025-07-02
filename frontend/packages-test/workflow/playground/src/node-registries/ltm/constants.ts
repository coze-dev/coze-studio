import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';

// 入参路径，试运行等功能依赖该路径提取参数
export const INPUT_PATH = 'inputs.inputParameters';

// 定义固定出参
export const OUTPUTS = [
  {
    key: nanoid(),
    name: 'outputList',
    type: ViewVariableType.ArrayObject,
    children: [
      {
        key: nanoid(),
        name: 'output',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'date',
        type: ViewVariableType.String,
      },
    ],
  },
];

export const COLUMNS = [
  {
    label: I18n.t('workflow_detail_node_parameter_name'),
    style: { width: 148 },
  },
  { label: I18n.t('workflow_detail_end_output_value') },
];
