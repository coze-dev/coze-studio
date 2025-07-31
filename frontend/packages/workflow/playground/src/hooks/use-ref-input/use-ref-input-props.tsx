/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  // Monitor changes in linkage variables to re-trigger the effect
  useEffect(() => {
    const hasDisabledTypes =
      Array.isArray(disabledTypes) && disabledTypes.length > 0;

    if (!keyPath || !hasDisabledTypes) {
      return;
    }

    const listener = variableService.onListenVariableTypeChange(
      keyPath,
      v => {
        // If the variable type changes and is located in disabledTypes, it needs to be cleared
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
