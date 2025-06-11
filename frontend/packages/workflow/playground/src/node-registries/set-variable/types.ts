import type { RefExpression } from '@coze-workflow/base';

export interface SetVariableItem {
  left: RefExpression;
  right: RefExpression;
}

export interface FormData {
  inputs: { inputParameters: SetVariableItem[] };
}
