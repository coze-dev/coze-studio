import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';

export function getOutputsDefaultValue() {
  return [
    {
      key: nanoid(),
      name: 'outputList',
      type: ViewVariableType.ArrayObject,
    },
    {
      key: nanoid(),
      name: 'rowNum',
      type: ViewVariableType.Integer,
    },
  ];
}
