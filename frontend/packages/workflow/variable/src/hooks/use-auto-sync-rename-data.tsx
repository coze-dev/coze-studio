/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from 'react';

import { VariableFieldKeyRenameService } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { traverseUpdateRefExpressionByRename } from '../core/utils/traverse-refs';

export function useAutoSyncRenameData(
  data: any,
  ctx: {
    onDataRenamed?: (_newData?: any) => void;
  } = {},
) {
  const { onDataRenamed } = ctx || {};
  const fieldRenameService: VariableFieldKeyRenameService = useService(
    VariableFieldKeyRenameService,
  );

  const latest = useRef(data);
  latest.current = data;

  useEffect(() => {
    const disposable = fieldRenameService.onRename(({ before, after }) => {
      traverseUpdateRefExpressionByRename(
        latest.current,
        { before, after },
        {
          onDataRenamed,
        },
      );
    });

    return () => disposable.dispose();
  }, []);
}
