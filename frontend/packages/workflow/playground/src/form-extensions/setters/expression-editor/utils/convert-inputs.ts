import { type ExpressionEditorTreeHelper } from '@coze-workflow/components';
import {
  type InputValueVO,
  type RefExpressionContent,
} from '@coze-workflow/base';

export function convertInputs(
  inputs: InputValueVO[],
): ExpressionEditorTreeHelper.Input[] {
  return inputs
    .map(i => {
      const res: ExpressionEditorTreeHelper.Input = {
        name: i.name ?? '',
        keyPath: [
          ...((i.input?.content as RefExpressionContent)?.keyPath || []),
        ], // 深拷贝一份
      };

      if (i?.children?.length) {
        res.children = convertInputs(i.children);
      }

      return res;
    })
    .filter(i => !!i.name);
}
