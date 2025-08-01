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

import { useEffect, useMemo } from 'react';

import { useRefresh, useService } from '@flowgram-adapter/free-layout-editor';
import { DisposableCollection } from '@flowgram-adapter/common';

import {
  GlobalVariableService,
  type State as GlobalVariableServiceState,
} from '../services/global-variable-service';

interface Params {
  // Whether to listen for variable load completion events (variable drill-down may change)
  listenVariableLoaded?: boolean;
}

export function useGlobalVariableServiceState(
  params: Params = {},
): GlobalVariableServiceState {
  const { listenVariableLoaded } = params;

  const globalVariableService = useService<GlobalVariableService>(
    GlobalVariableService,
  );

  const refresh = useRefresh();

  useEffect(() => {
    const toDispose = new DisposableCollection();

    toDispose.push(
      globalVariableService.onBeforeLoad(() => {
        refresh();
      }),
    );

    if (listenVariableLoaded) {
      toDispose.push(
        globalVariableService.onLoaded(() => {
          refresh();
        }),
      );
    }

    return () => toDispose.dispose();
  }, []);

  return useMemo(
    () => globalVariableService.state,
    [globalVariableService.state],
  );
}
