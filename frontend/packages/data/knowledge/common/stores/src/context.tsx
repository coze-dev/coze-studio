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

import { createContext, type PropsWithChildren, type FC, useRef } from 'react';

import {
  type ProcessingKnowledgeStore,
  createProcessingKnowledgeStore,
} from './processing-knowledge';
import {
  type IParams,
  type ParamsStore,
  createParamsStore,
} from './params-store';
import {
  type KnowledgePreviewStore,
  createKnowledgePreviewStore,
} from './knowledge-preview';

export type WidgetUIState = 'loading' | 'saving' | 'error' | 'normal';

export interface PluginNavType {
  toResource?: (
    res: string,
    resID?: string,
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
  // submodule
  upload?: (
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
  navigateTo?: (
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
}

export interface CallbacksType {
  onUpdateDisplayName?: (displayName: string) => void;
  onStatusChange?: (status: WidgetUIState) => void;
}

interface TParamsStoreContext {
  paramsStore: ParamsStore | undefined;
  knowledgeStore: KnowledgePreviewStore | undefined;
  processingKnowledge: ProcessingKnowledgeStore | undefined;
  callbacks: CallbacksType;
  resourceNavigate: PluginNavType;
}

export const KnowledgeParamsStoreContext = createContext<TParamsStoreContext>({
  paramsStore: undefined,
  knowledgeStore: undefined,
  processingKnowledge: undefined,
  callbacks: {},
  resourceNavigate: {},
});

export const KnowledgeParamsStoreProvider: FC<
  PropsWithChildren<{
    params: IParams;
    onUpdateDisplayName?: (displayName: string) => void;
    onStatusChange?: (status: WidgetUIState) => void;
    resourceNavigate: PluginNavType;
  }>
> = ({
  children,
  params,
  onUpdateDisplayName,
  onStatusChange,
  resourceNavigate,
}) => {
  const paramsStoreRef = useRef<ParamsStore>();
  const knowledgeStoreRef = useRef<KnowledgePreviewStore>();
  const processingStoreRef = useRef<ProcessingKnowledgeStore>();

  paramsStoreRef.current = createParamsStore(params);

  if (!knowledgeStoreRef.current) {
    knowledgeStoreRef.current = createKnowledgePreviewStore({
      version: params.version,
    });
  }
  if (!processingStoreRef.current) {
    processingStoreRef.current = createProcessingKnowledgeStore();
  }

  return (
    <KnowledgeParamsStoreContext.Provider
      value={{
        paramsStore: paramsStoreRef.current,
        knowledgeStore: knowledgeStoreRef.current,
        processingKnowledge: processingStoreRef.current,
        callbacks: { onUpdateDisplayName, onStatusChange },
        resourceNavigate,
      }}
    >
      {children}
    </KnowledgeParamsStoreContext.Provider>
  );
};
