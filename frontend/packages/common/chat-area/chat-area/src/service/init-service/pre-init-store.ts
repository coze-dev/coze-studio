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
   * Clear Store Set
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
