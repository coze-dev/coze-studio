import { nanoid } from 'nanoid';
import { ValueExpressionType, ViewVariableType } from '@coze-workflow/variable';
import { VariableTypeDTO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { CONVERSATION_NAME } from '../constants';

export const FIELD_CONFIG = {
  conversationName: {
    description: I18n.t('workflow_250407_028'),
    name: CONVERSATION_NAME,
    required: true,
    type: VariableTypeDTO.string,
  },
  rounds: {
    description: I18n.t('workflow_250407_029'),
    name: 'rounds',
    required: true,
    type: VariableTypeDTO.integer,
  },
};

export const DEFAULT_CONVERSATION_VALUE = Object.keys(FIELD_CONFIG).map(
  fieldName => ({
    name: fieldName,
    input: {
      type: ValueExpressionType.REF,
    },
  }),
);

export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'messageList',
    type: ViewVariableType.ArrayObject,
    children: [
      {
        key: nanoid(),
        name: 'role',
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
