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

import { useRef, type PropsWithChildren, createContext } from 'react';

import { create } from 'zustand';
import {
  ComponentType,
  type BizCtx,
  type ComponentSubject,
  type CaseDataDetail,
} from '@coze-arch/bot-api/debugger_api';

import { validateTestsetSchema } from '../../utils';
import type {
  ValidateSchemaResult,
  TestsetEditMode,
  NodeFormItem,
} from '../../types';
import { TESTSET_CONNECTOR_ID, type FormItemSchemaType } from '../../constants';

export interface TestsetManageState {
  bizCtx?: BizCtx;
  bizComponentSubject?: ComponentSubject;

  projectId?: string;

  /**
   * check cache
   */
  validateCache: ValidateSchemaResult;

  /**
   * Edit Panel Status
   */
  editPanelVisible: boolean;
  editData: CaseDataDetail | null;
  editMode: TestsetEditMode;
  editPanelCloseState: boolean;

  /**
   * autofill status
   */
  generating: boolean;
  /**
   * Custom rendering component, temporarily passed in from the outside, no more in the future
   */
  formRenders: Partial<Record<FormItemSchemaType, NodeFormItem>>;
}

export interface TestsetManageAction {
  /** update status */
  patch: (s: Partial<TestsetManageState>) => void;
  /**
   * Validation schema
   */
  validateSchema: () => Promise<ValidateSchemaResult>;
  /**
   * Open the editing panel
   */
  openEditPanel: (data?: CaseDataDetail) => void;
  /**
   * Close the edit panel
   */
  closeEditPanel: () => void;

  updateEditPanelCloseState: (state: boolean) => void;
}

const createTestsetManageState = (initState: Partial<TestsetManageState>) => {
  const { bizCtx = {}, bizComponentSubject = {}, ...rest } = initState;
  return create<TestsetManageState & TestsetManageAction>((set, get) => ({
    bizCtx: {
      connectorID: TESTSET_CONNECTOR_ID,
      ...bizCtx,
    },
    bizComponentSubject: {
      componentType: ComponentType.CozeStartNode,
      parentComponentType: ComponentType.CozeWorkflow,
      ...bizComponentSubject,
    },

    formRenders: {},
    ...rest,
    validateCache: 'pending',
    editPanelVisible: false,
    editPanelCloseState: false,
    editMode: 'edit',
    editData: null,
    generating: false,
    patch: s => {
      set(() => s);
    },
    validateSchema: async () => {
      const store = get();
      if (store.validateCache !== 'pending') {
        return store.validateCache;
      }
      const res = await validateTestsetSchema({
        bizCtx: store.bizCtx,
        bizComponentSubject: store.bizComponentSubject,
      });
      set(() => ({ validateCache: res }));
      return res;
    },
    openEditPanel: data => {
      set(() => ({
        editData: data || null,
        editMode: data ? 'edit' : 'create',
        editPanelVisible: true,
        editPanelCloseState: true,
      }));
    },
    closeEditPanel: () => {
      set(() => ({
        editPanelVisible: false,
        editPanelCloseState: false,
      }));
    },
    updateEditPanelCloseState: state => {
      set(() => ({
        editPanelCloseState: state,
      }));
    },
  }));
};

type TestsetManageStore = ReturnType<typeof createTestsetManageState>;

export const TestsetManageContext = createContext<TestsetManageStore>(
  {} as unknown as TestsetManageStore,
);

interface TestsetManageProviderProps {
  spaceId: string;
  workflowId: string;
  userId?: string;
  nodeId?: string;
  projectId?: string;
  formRenders?: Partial<Record<FormItemSchemaType, NodeFormItem>>;
}

export const TestsetManageProvider: React.FC<
  PropsWithChildren<TestsetManageProviderProps>
> = ({
  spaceId,
  workflowId,
  userId,
  nodeId,
  projectId,
  formRenders,
  children,
}) => {
  // Initialize only once
  const storeRef = useRef<TestsetManageStore>(
    createTestsetManageState({
      bizCtx: {
        bizSpaceID: spaceId,
        connectorUID: userId,
      },
      bizComponentSubject: {
        componentID: nodeId,
        parentComponentID: workflowId,
      },
      projectId,
      formRenders,
    }),
  );

  return (
    <TestsetManageContext.Provider value={storeRef.current}>
      {children}
    </TestsetManageContext.Provider>
  );
};
