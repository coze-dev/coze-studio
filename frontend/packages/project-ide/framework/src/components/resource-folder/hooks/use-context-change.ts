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

import { useRef } from 'react';

import { ContextKeyService, useIDEService } from '@coze-project-ide/client';

import { type ResourceFolderContextType } from '../type';
import { RESOURCE_FOLDER_CONTEXT_KEY } from '../constant';

const useContextChange = (id: string) => {
  const contextRef = useRef<Partial<ResourceFolderContextType>>({
    id,
  });

  const contextService = useIDEService<ContextKeyService>(ContextKeyService);

  const setContext = dispatch => {
    contextService.setContext(RESOURCE_FOLDER_CONTEXT_KEY, dispatch);
  };

  const getContext = (): Partial<ResourceFolderContextType> =>
    contextService.getContext(RESOURCE_FOLDER_CONTEXT_KEY);

  const updateContext = (other: Partial<ResourceFolderContextType>) => {
    if (getContext()?.id === id) {
      contextRef.current = {
        ...contextRef.current,
        ...other,
      };
      setContext(contextRef.current);
    }
  };

  const updateId = () => {
    setContext(contextRef.current);
  };

  const clearContext = () => {
    if (getContext()?.id === id) {
      contextService.setContext(RESOURCE_FOLDER_CONTEXT_KEY, undefined);
    }
    contextRef.current = {
      id,
    };
  };

  return { updateContext, clearContext, updateId };
};

export { useContextChange };
