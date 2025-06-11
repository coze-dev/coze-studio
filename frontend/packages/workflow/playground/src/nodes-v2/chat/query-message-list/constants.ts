import { nanoid } from 'nanoid';
import { ValueExpressionType, ViewVariableType } from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';

import { CONVERSATION_NAME } from '../constants';

export const FIELD_CONFIG = {
  [CONVERSATION_NAME]: {
    description: I18n.t('wf_chatflow_24'),
    name: CONVERSATION_NAME,
    required: true,
    type: 'string',
  },
  limit: {
    description: I18n.t('wf_chatflow_34'),
    name: 'limit',
    required: false,
    type: 'integer',
  },
  beforeId: {
    description: I18n.t('wf_chatflow_35'),
    name: 'beforeId',
    required: false,
    type: 'string',
  },
  afterId: {
    description: I18n.t('wf_chatflow_36'),
    name: 'afterId',
    required: false,
    type: 'string',
  },
};

export const DEFAULT_CONVERSATION_VALUE = [
  {
    name: CONVERSATION_NAME,
    input: {
      type: ValueExpressionType.REF,
    },
  },
  {
    name: 'limit',
    input: {
      type: ValueExpressionType.REF,
    },
  },
  {
    name: 'beforeId',
    input: {
      type: ValueExpressionType.REF,
    },
  },
  {
    name: 'afterId',
    input: {
      type: ValueExpressionType.REF,
    },
  },
];

export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'messageList',
    type: ViewVariableType.ArrayObject,
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
  {
    key: nanoid(),
    name: 'firstId',
    type: ViewVariableType.String,
  },
  {
    key: nanoid(),
    name: 'lastId',
    type: ViewVariableType.String,
  },
  {
    key: nanoid(),
    name: 'hasMore',
    type: ViewVariableType.Boolean,
  },
];
