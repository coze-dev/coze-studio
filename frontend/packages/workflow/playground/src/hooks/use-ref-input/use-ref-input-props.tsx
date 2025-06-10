import { useEffect } from 'react';

import { get } from 'lodash-es';
import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowVariableService,
  useVariableTypeChange,
} from '@coze-workflow/variable';
import {
  ValueExpressionType,
  type ValueExpression,
  type ViewVariableType,
} from '@coze-workflow/base';

import { useNodeAvailableVariablesWithNode } from '@/form-extensions/hooks';
import { feedbackStatus2ValidateStatus } from '@/form-extensions/components/utils';
import { formatWithNodeVariables } from '@/form-extensions/components/tree-variable-selector/utils';

export const useRefInputProps = ({
  disabledTypes,
  value,
  onChange,
  node,
  feedbackStatus,
}: {
  disabledTypes?: ViewVariableType[];
  value?: ValueExpression;
  onChange: (v: ValueExpression) => void;
  node: FlowNodeEntity;
  feedbackStatus?: FeedbackStatus;
}) => {
  const availableVariables = useNodeAvailableVariablesWithNode();

  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );
  const variablesDataSource = formatWithNodeVariables(
    availableVariables,
    disabledTypes || [],
  );

  const keyPath = get(value, 'content.keyPath') as unknown as string[];

  // 监听联动变量变化，从而重新触发 effect
  useEffect(() => {
    const hasDisabledTypes =
      Array.isArray(disabledTypes) && disabledTypes.length > 0;

    if (!keyPath || !hasDisabledTypes) {
      return;
    }

    const listener = variableService.onListenVariableTypeChange(
      keyPath,
      v => {
        // 如果变量类型变化后，位于 disabledTypes 中，那么需要清空
        if (v && (disabledTypes || []).includes(v.type)) {
          onChange({
            type: ValueExpressionType.REF,
          });
        }
      },
      { node },
    );

    return () => {
      listener?.dispose();
    };
  }, [keyPath, disabledTypes]);

  useVariableTypeChange({
    keyPath,
    onTypeChange: ({ variableMeta: v }) => {
      const hasDisabledTypes =
        Array.isArray(disabledTypes) && disabledTypes.length > 0;
      if (!hasDisabledTypes) {
        return;
      }

      if (v && (disabledTypes || []).includes(v.type)) {
        onChange({
          type: ValueExpressionType.REF,
        });
      }
    },
  });

  return {
    variablesDataSource,
    validateStatus: feedbackStatus2ValidateStatus(feedbackStatus),
  };
};
