import { type Reporter } from '@coze-arch/logger';

import { type PluginStore } from '../../store/plugins';
import type { LoadMoreClientMethod } from '../../service/load-more';
import type {
  ChatAreaContext,
  StoreSet,
} from '../../context/chat-area-context/type';
import { type useChatActionLockService } from '../../context/chat-action-lock';

export type Selector<T> = <U>(params: {
  selector: (state: T) => U;
  equalityFn?: (a: U, b: U) => boolean;
}) => U;

export interface LifeCycleContext {
  reporter?: Reporter;
  usePluginStore: PluginStore;
}

export interface MethodCommonDeps {
  context: Pick<
    ChatAreaContext,
    'reporter' | 'eventCallback' | 'lifeCycleService'
  >;
  storeSet: StoreSet;
  services: {
    loadMoreClient: LoadMoreClientMethod;
    chatActionLockService: ReturnType<typeof useChatActionLockService>;
  };
}
