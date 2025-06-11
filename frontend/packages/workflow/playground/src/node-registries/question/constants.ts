import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

export const DEFAULT_USER_RESPONSE_PARAM_NAME = 'USER_RESPONSE';
export const DEFAULT_OPTION_ID_NAME = 'optionId';
export const DEFAULT_OPTION_CONTENT_NAME = 'optionContent';

export const DEFAULT_OUTPUT_NAMES = [
  DEFAULT_USER_RESPONSE_PARAM_NAME,
  DEFAULT_OPTION_ID_NAME,
  DEFAULT_OPTION_CONTENT_NAME,
];

export const DEFAULT_USE_RESPONSE = [
  {
    key: nanoid(),
    name: DEFAULT_USER_RESPONSE_PARAM_NAME,
    type: ViewVariableType.String,
    required: true,
    description: I18n.t(
      'workflow_ques_ans_type_direct_key_decr',
      {},
      '用户本轮对话输入内容',
    ),
  },
];

export const DEFAULT_EXTRACT_OUTPUT = [
  {
    key: nanoid(),
    name: 'output',
    type: ViewVariableType.String,
    required: true,
  },
];

export const DEFAULT_ANSWER_OPTION_OUTPUT = [
  {
    key: nanoid(),
    name: DEFAULT_OPTION_ID_NAME,
    type: ViewVariableType.String,
    required: false,
  },
  {
    key: nanoid(),
    name: DEFAULT_OPTION_CONTENT_NAME,
    type: ViewVariableType.String,
    required: false,
  },
];
