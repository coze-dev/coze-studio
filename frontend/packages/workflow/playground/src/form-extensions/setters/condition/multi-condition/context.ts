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

import { createContext, useContext } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

interface ConditionContext {
  flowNodeEntity: FlowNodeEntity | null;
  readonly: boolean;
  expanded?: boolean;
  setterPath: string;
}
// eslint-disable-next-line @typescript-eslint/naming-convention -- react context
const ConditionContext = createContext<ConditionContext>({
  flowNodeEntity: null,
  readonly: false,
  setterPath: '',
});
export const useConditionContext = () => useContext(ConditionContext);

// eslint-disable-next-line @typescript-eslint/naming-convention -- react context
export const ConditionContextProvider = ConditionContext.Provider;
