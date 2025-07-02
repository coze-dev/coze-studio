import { useState } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableType } from '@coze-workflow/base/types';

import { WorkflowVariableService } from '../legacy';
import { useVariableTypeChange } from './use-variable-type-change';

export const useVariableType = (
  keyPath: string[],
): ViewVariableType | undefined => {
  const node = useCurrentEntity();

  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  const originType = variableService.getWorkflowVariableByKeyPath(keyPath, {
    node,
  })?.viewType;

  const [variableType, setVariableType] = useState<
    ViewVariableType | undefined
  >(originType);

  useVariableTypeChange({
    keyPath,
    onTypeChange: ({ variableMeta }) => {
      setVariableType(variableMeta?.type);
    },
  });

  return variableType;
};
