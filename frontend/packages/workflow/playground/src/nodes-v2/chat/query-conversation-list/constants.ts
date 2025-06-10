import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';

export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'conversationList',
    type: ViewVariableType.ArrayObject,
    children: [
      {
        key: nanoid(),
        name: 'conversationName',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'conversationId',
        type: ViewVariableType.String,
      },
    ],
  },
];
