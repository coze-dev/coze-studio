import { type FC } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { useVariableTypeChange } from '@coze-workflow/variable';

import { type ConditionItem } from '../multi-condition/types';
interface HiddenConditionItemProps {
  data: ConditionItem;
  onDataChange: (data: ConditionItem) => void;
}

export const HiddenConditionItem: FC<HiddenConditionItemProps> = props => {
  const { data, onDataChange } = props;
  const doc = useService<WorkflowDocument>(WorkflowDocument);

  // 监听联动变量变化，从而重新触发 effect
  useVariableTypeChange({
    keyPath: data.left?.content?.keyPath,
    onTypeChange: ({ variableMeta }) => {
      // HACK 历史版本加载到草稿时（加载到草稿操作，调了画布reload方法，导致触发了一次副作用），不触发UI联动
      if (doc.loading) {
        return;
      }

      if (!variableMeta) {
        // 变量被删除了
        onDataChange?.({});
        return;
      }

      onDataChange?.({
        left: data.left,
      });
    },
  });

  return null;
};
