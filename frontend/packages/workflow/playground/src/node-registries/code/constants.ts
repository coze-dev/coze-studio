import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';

// 路径
export const INPUT_PATH = 'inputParameters';
export const CODE_PATH = 'codeParams';
export const OUTPUT_PATH = 'outputs';

// 默认值
export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'key0',
    type: ViewVariableType.String,
  },
  {
    key: nanoid(),
    name: 'key1',
    type: ViewVariableType.ArrayString,
  },
  {
    key: nanoid(),
    name: 'key2',
    type: ViewVariableType.Object,
    children: [
      {
        key: nanoid(),
        name: 'key21',
        type: ViewVariableType.String,
      },
    ],
  },
];

export const DEFAULT_INPUTS = [{ name: 'input' }];
