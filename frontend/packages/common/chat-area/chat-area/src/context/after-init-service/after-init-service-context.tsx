import { createContext } from 'react';

import { type MarkReadService } from '../../service/mark-read';

/**
 * 不需要放到最外层 Provider 里的 service 实例提供 Context
 */

export interface AfterInitService {
  markReadService?: MarkReadService;
}

export const AfterInitServiceContext = createContext<AfterInitService>({});

export const AfterInitServiceProvider = AfterInitServiceContext.Provider;
