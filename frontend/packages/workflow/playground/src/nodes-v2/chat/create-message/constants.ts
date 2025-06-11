import { nanoid } from 'nanoid';
import { ValueExpressionType, ViewVariableType } from '@coze-workflow/variable';
import { type InputValueVO, VariableTypeDTO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { CONVERSATION_NAME } from '../constants';

export const FIELD_CONFIG = {
  conversationName: {
    description: I18n.t('workflow_250407_005'),
    name: CONVERSATION_NAME,
    required: true,
    type: VariableTypeDTO.string,
  },

  role: {
    description: I18n.t('workflow_250407_006'),
    name: 'role',
    required: true,
    type: VariableTypeDTO.string,

    // 选项默认值
    defaultValue: 'user',

    // 选项列表
    optionsList: [
      { label: 'user', value: 'user' },
      { label: 'assistant', value: 'assistant' },
    ],
  },

  content: {
    description: I18n.t('workflow_250407_007'),
    name: 'content',
    required: true,
    type: VariableTypeDTO.string,
  },
};

export const DEFAULT_CONVERSATION_VALUE: InputValueVO[] = Object.keys(
  FIELD_CONFIG,
).map(fieldName => {
  // 针对 role 字段，需要设置字面量默认值
  if (fieldName === 'role') {
    return {
      name: fieldName,
      input: {
        type: ValueExpressionType.LITERAL,
        content: FIELD_CONFIG[fieldName].defaultValue,
      },
    };
  }

  return {
    name: fieldName,
    input: {
      type: ValueExpressionType.REF,
    },
  };
});

export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'isSuccess',
    type: ViewVariableType.Boolean,
  },
  {
    key: nanoid(),
    name: 'message',
    type: ViewVariableType.Object,
    children: [
      {
        key: nanoid(),
        name: 'messageId',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'role',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'contentType',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'content',
        type: ViewVariableType.String,
      },
    ],
  },
];
