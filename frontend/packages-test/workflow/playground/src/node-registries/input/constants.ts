import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/variable';

// 定义固定出参
export const OUTPUTS = [
  {
    key: nanoid(),
    name: 'input',
    type: ViewVariableType.String,
    required: true,
  },
];
