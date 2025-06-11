import { useEffect } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableService } from '../legacy';

interface HooksParams {
  keyPath?: string[];
  onDispose?: () => void;
}

/**
 * @deprecated 变量销毁存在部分 Bad Case
 * - 全局变量因切换 Project 销毁后，变量引用会被置空，导致变量引用失效
 */
export function useVariableDispose(params: HooksParams) {
  const { keyPath, onDispose } = params;

  const node = useCurrentEntity();
  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  useEffect(() => {
    if (!keyPath) {
      return () => null;
    }

    const disposable = variableService.onListenVariableDispose(
      keyPath,
      () => {
        onDispose?.();
      },
      { node },
    );

    return () => disposable.dispose();
  }, [keyPath?.join('.')]);

  return;
}
