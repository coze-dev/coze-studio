import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';

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
        name: 'triggerId',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'triggerName',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'createTime',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'triggerTime',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'userId',
        type: ViewVariableType.String,
      },
    ],
  },
];
