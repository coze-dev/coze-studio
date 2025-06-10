/* eslint-disable security/detect-object-injection */
import { useEffect, useRef } from 'react';

import {
  useCurrentEntity,
  useRefresh,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { DisposableCollection } from '@flowgram-adapter/common';
import { type ViewVariableMeta } from '@coze-workflow/base';

import { WorkflowVariableFacadeService } from '../core';

type TypeChange = (params: { variableMeta?: ViewVariableMeta | null }) => void;

interface HooksParams {
  keyPath?: string[];
  onTypeChange?: TypeChange;
}

export function useVariableTypeChange(params: HooksParams) {
  const { keyPath, onTypeChange } = params;

  const node = useCurrentEntity();

  const keyPathRef = useRef<string[] | undefined>([]);
  keyPathRef.current = keyPath;

  const refresh = useRefresh();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  const callbackRef = useRef<TypeChange | undefined>();
  callbackRef.current = onTypeChange;

  useEffect(() => {
    if (!keyPath) {
      return () => null;
    }

    const toDispose = new DisposableCollection();

    const variable = facadeService.getVariableFacadeByKeyPath(keyPath, {
      node,
    });

    toDispose.push(
      facadeService.listenKeyPathTypeChange(keyPath, meta => {
        callbackRef.current?.({ variableMeta: meta });
      }),
    );

    if (variable) {
      toDispose.push(
        variable.onRename(({ modifyIndex, modifyKey }) => {
          if (keyPathRef.current) {
            // 更改 keyPath 并刷新，重新监听变量变化
            keyPathRef.current[modifyIndex] = modifyKey;
          }
          refresh();
        }),
      );
    }

    return () => toDispose.dispose();
  }, [keyPathRef.current?.join('.')]);

  return;
}
