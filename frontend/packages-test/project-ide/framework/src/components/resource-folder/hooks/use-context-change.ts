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
