import { useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { type RenameInfo } from '../core/types';
import { WorkflowVariableFacadeService } from '../core';

interface HooksParams {
  keyPath?: string[];
  onRename?: (params: RenameInfo) => void;
}

export function useVariableRename({ keyPath, onRename }: HooksParams) {
  const node = useCurrentEntity();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  useEffect(() => {
    if (!keyPath) {
      return;
    }

    const variable = facadeService.getVariableFacadeByKeyPath(keyPath, {
      node,
    });
    const disposable = variable?.onRename(_params => {
      onRename?.(_params);
    });

    return () => disposable?.dispose();
  }, [keyPath?.join('.')]);

  return;
}
