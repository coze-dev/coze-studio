import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';

export const CONDITION_PATH = 'condition';
export const ELSE_PATH = 'else';

// 定义固定出参
export const OUTPUTS = [
  {
    key: nanoid(),
    name: 'outputList',
    type: ViewVariableType.ArrayObject,
    children: [
      {
        key: nanoid(),
        name: 'id',
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
