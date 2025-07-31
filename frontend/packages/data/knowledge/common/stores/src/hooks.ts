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

import { useContext } from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';

import {
  type ProcessingKnowledgeInfo,
  type ProcessingKnowledgeInfoAction,
} from './processing-knowledge';
import { type IParamsStore } from './params-store';
import { type ILevelSegmentsSlice } from './level-segments-slice';
import {
  type KnowledgePreviewAction,
  type KnowledgePreviewState,
} from './knowledge-preview';
import {
  type CallbacksType,
  type PluginNavType,
  KnowledgeParamsStoreContext,
} from './context';

export const useKnowledgeParamsStore: <T>(
  selector: (store: IParamsStore) => T,
) => T = selector => {
  const context = useContext(KnowledgeParamsStoreContext);

  if (!context.paramsStore) {
    throw new CustomError(REPORT_EVENTS.normalError, 'params store context');
  }

  return useStoreWithEqualityFn(context.paramsStore, selector, shallow);
};

export const useKnowledgeParams = () => {
  const params = useKnowledgeParamsStore(store => store.params);
  return params;
};

export const useDataCallbacks: () => CallbacksType = () => {
  const {
    callbacks: { onStatusChange, onUpdateDisplayName },
  } = useContext(KnowledgeParamsStoreContext);

  return { onStatusChange, onUpdateDisplayName };
};

export const useDataNavigate: () => PluginNavType = () => {
  const { resourceNavigate } = useContext(KnowledgeParamsStoreContext);

  return resourceNavigate;
};

export const useKnowledgeStore: <T>(
  selector: (
    store: KnowledgePreviewState & KnowledgePreviewAction & ILevelSegmentsSlice,
  ) => T,
) => T = selector => {
  const context = useContext(KnowledgeParamsStoreContext);

  if (!context.knowledgeStore) {
    throw new CustomError(REPORT_EVENTS.normalError, 'params store context');
  }

  return useStoreWithEqualityFn(context.knowledgeStore, selector, shallow);
};

export const useProcessingStore: <T>(
  selector: (
    store: ProcessingKnowledgeInfo & ProcessingKnowledgeInfoAction,
  ) => T,
) => T = selector => {
  const context = useContext(KnowledgeParamsStoreContext);

  if (!context.processingKnowledge) {
    throw new CustomError(REPORT_EVENTS.normalError, 'params store context');
  }

  return useStoreWithEqualityFn(context.processingKnowledge, selector, shallow);
};
