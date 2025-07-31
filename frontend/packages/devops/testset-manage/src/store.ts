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

import { create } from 'zustand';
import {
  type BizCtx,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';

import { type NodeFormItem, type FormItemSchemaType } from './types';
import { type TestsetManageEventName } from './events';

export interface TestsetManageState {
  bizCtx?: BizCtx;
  bizComponentSubject?: ComponentSubject;
  /** edit permission */
  editable?: boolean;
  /** form rendering component */
  formRenders?: Partial<Record<FormItemSchemaType, NodeFormItem>>;
  /** Event tracking event reporting */
  reportEvent?: (
    name: TestsetManageEventName,
    params?: Record<string, unknown>,
  ) => void;
}

export interface TestsetManageAction {
  /** update status */
  patch: (s: Partial<TestsetManageState>) => void;
}

export type TestsetManageProps = TestsetManageState & TestsetManageAction;

export function createTestsetManageStore(
  initState: Partial<TestsetManageState>,
) {
  return create<TestsetManageProps>((set, get) => ({
    ...initState,
    patch: s => {
      set(prev => ({ ...prev, ...s }));
    },
  }));
}

interface InnerState {
  generating: boolean;
}

interface InnerAction {
  patch: (s: Partial<InnerState>) => void;
}

export const useInnerStore = create<InnerState & InnerAction>((set, get) => ({
  generating: false,
  patch: s => {
    set({ ...s });
  },
}));
