import { nanoid } from 'nanoid';
import {
  type ViewVariableMeta,
  ViewVariableType,
} from '@coze-workflow/variable';

// 入参路径，试运行等功能依赖该路径提取参数
export const INPUT_PATH = 'inputs';

// 定义固定出参
export const OUTPUTS: ViewVariableMeta[] = [
  {
    key: nanoid(),
    name: 'triggerId',
    type: ViewVariableType.String,
  },
];
