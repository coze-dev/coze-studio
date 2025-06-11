import { nanoid } from 'nanoid';
import { ValueExpressionType, ViewVariableType } from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';

import { CONVERSATION_NAME } from '../constants';

export const FIELD_CONFIG = {
  conversationName: {
    description: I18n.t('workflow_250407_023'),
    name: CONVERSATION_NAME,
    required: true,
    type: 'string',
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
    name: 'isSuccess',
    type: ViewVariableType.Boolean,
  },
];
