import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

export const DEFAULT_SUCCESS_OUTPUT = [
  {
    key: nanoid(),
    name: 'isSuccess',
    type: ViewVariableType.Boolean,
    required: true,
    description: I18n.t(
      'workflow_detail_variable_set_output_tooltip',
      {},
      '变量设置是否成功',
    ),
  },
];

export const DEFAULT_GET_OUTPUT = [
  {
    key: nanoid(),
    name: '',
    type: ViewVariableType.String,
    required: true,
  },
];

export enum ModeValue {
  Get = 'get',
  Set = 'set',
}
