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

import React, { useMemo, type ReactElement } from 'react';

import {
  FlowNodeVariableData,
  type Scope,
  ScopeProvider,
} from '@flowgram-adapter/free-layout-editor';
import { useEntityFromContext } from '@flowgram-adapter/free-layout-editor';

interface VariableProviderProps {
  children: ReactElement | ReactElement[];
}

export const PrivateScopeProvider = ({ children }: VariableProviderProps) => {
  const node = useEntityFromContext();

  const privateScope: Scope = useMemo(() => {
    const variableData: FlowNodeVariableData =
      node.getData(FlowNodeVariableData);
    if (!variableData.private) {
      variableData.initPrivate();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return variableData.private!;
  }, [node]);

  return (
    <ScopeProvider value={{ scope: privateScope }}>{children}</ScopeProvider>
  );
};
