import { type Scene } from '@coze-common/chat-core';
import { exhaustiveCheckForRecord } from '@coze-common/chat-area-utils';
import { type Reporter } from '@coze-arch/logger';

import { createPluginStore } from '../../store/plugins';
import {
  type ExtendDataLifecycle,
  type StoreSet,
} from '../../context/chat-area-context/type';

export interface PreInitStoreContext {
  reporter: Reporter;
  extendDataLifecycle?: ExtendDataLifecycle;
  mark: string;
  scene: Scene;
}

export class PreInitStoreService {
  public prePositionedStoreSet: Pick<StoreSet, 'usePluginStore'>;
  private context: PreInitStoreContext;

  constructor(context: PreInitStoreContext) {
    this.context = context;

    const usePluginStore = createPluginStore(this.context.mark);
    this.prePositionedStoreSet = {
      usePluginStore,
    };
  }

  /**
   * 清除 Store Set
   */
  public clearStoreSet() {
    if (!this.prePositionedStoreSet) {
      return;
    }

    const { usePluginStore, ...prePositionedRest } = this.prePositionedStoreSet;

    exhaustiveCheckForRecord(prePositionedRest);
    usePluginStore.getState().clearPluginStore();
  }
}
