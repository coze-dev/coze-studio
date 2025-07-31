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
            // Change keyPath and refresh, re-listen for variable changes
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
