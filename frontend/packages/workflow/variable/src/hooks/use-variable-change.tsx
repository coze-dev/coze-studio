import { useEffect } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableMeta } from '@coze-workflow/base';

import { WorkflowVariableService } from '../legacy';

interface HooksParams {
  keyPath?: string[];
  onChange?: (params: { variableMeta?: ViewVariableMeta | null }) => void;
}

export function useVariableChange(params: HooksParams) {
  const { keyPath, onChange } = params;

  const node = useCurrentEntity();
  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  useEffect(() => {
    if (!keyPath) {
      return () => null;
    }

    const disposable = variableService.onListenVariableChange(
      keyPath,
      meta => {
        onChange?.({ variableMeta: meta });
      },
      { node },
    );

    return () => disposable.dispose();
  }, [keyPath?.join('.')]);

  return;
}
