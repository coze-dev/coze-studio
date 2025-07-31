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

import { createPluginBenchmark } from '../create-plugin-benchmark';
import {
  type OnRefreshMessageListError,
  type OnAfterCallback,
  type OnAfterInitialContext,
} from '../../types/plugin-class/app-life-cycle';
import { type LifeCycleContext } from '../../types';
import { type OnBeforeListenChatCoreParam } from '../../plugin-class/service/app-life-cycle-service';
import { type AppLifeCycle, LifeCycleScope } from '../../constants/plugin';
import { proxyFreeze } from '../../../utils/proxy-freeze';

type Expect<T extends true> = T;

type TestClassIncludeAppLifeCycleKeys =
  AppLifeCycle extends keyof SystemAppLifeCycleService ? true : false;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars -- detect type usage
type _ = Expect<TestClassIncludeAppLifeCycleKeys>;

export class SystemAppLifeCycleService {
  private lifeCycleContext: LifeCycleContext;

  constructor(lifeCycleContext: LifeCycleContext) {
    this.lifeCycleContext = lifeCycleContext;
  }

  onAfterCreateStores(stores: OnAfterCallback) {
    const lifeCycleName: AppLifeCycle = 'onAfterCreateStores';
    const lifeCycleScope = LifeCycleScope.App;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - App - onAfterCreateStores Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      plugin.lifeCycleServices?.appLifeCycleService?.onAfterCreateStores?.(
        stores,
      );
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - App - onAfterCreateStores End
     */
  }

  onBeforeInitial() {
    const lifeCycleName: AppLifeCycle = 'onBeforeInitial';
    const lifeCycleScope = LifeCycleScope.App;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - App - OnBeforeInitial Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      plugin.lifeCycleServices?.appLifeCycleService?.onBeforeInitial?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - App - OnBeforeInitial End
     */
  }

  onAfterInitial({ ctx }: { ctx: OnAfterInitialContext }) {
    const lifeCycleName: AppLifeCycle = 'onAfterInitial';
    const lifeCycleScope = LifeCycleScope.App;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - App - OnAfterInitial Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);
    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      plugin.lifeCycleServices?.appLifeCycleService?.onAfterInitial?.(
        proxyFreezeContext,
      );
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();

    /**
     * CycleLife - App - OnAfterInitial End
     */
  }

  onInitialError() {
    const lifeCycleName: AppLifeCycle = 'onInitialError';
    const lifeCycleScope = LifeCycleScope.App;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - App - OnInitialError Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      plugin.lifeCycleServices?.appLifeCycleService?.onInitialError?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();

    /**
     * CycleLife - App - OnInitialError End
     */
  }

  onBeforeDestroy() {
    const lifeCycleName: AppLifeCycle = 'onBeforeDestroy';
    const lifeCycleScope = LifeCycleScope.App;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - App - OnBeforeDestroy Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      plugin.lifeCycleServices?.appLifeCycleService?.onBeforeDestroy?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - App - OnBeforeDestroy End
     */
  }

  onBeforeRefreshMessageList() {
    const { usePluginStore } = this.lifeCycleContext;
    /**
     * CycleLife - App - onBeforeRefreshMessageList Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.appLifeCycleService?.onBeforeRefreshMessageList?.();
    }
    /**
     * CycleLife - App - onBeforeRefreshMessageList End
     */
  }

  onAfterRefreshMessageList() {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - App - onAfterRefreshMessageList Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.appLifeCycleService?.onAfterRefreshMessageList?.();
    }
    /**
     * CycleLife - App - onAfterRefreshMessageList End
     */
  }

  onRefreshMessageListError({ ctx }: { ctx: OnRefreshMessageListError }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - App - onRefreshMessageListError Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.appLifeCycleService?.onRefreshMessageListError?.(
        ctx,
      );
    }
    /**
     * CycleLife - App - onRefreshMessageListError End
     */
  }

  onBeforeListenChatCore(param: OnBeforeListenChatCoreParam) {
    const { usePluginStore } = this.lifeCycleContext;

    const { pluginInstanceList } = usePluginStore.getState();
    let abort = false;

    for (const plugin of pluginInstanceList) {
      const res =
        plugin.lifeCycleServices?.appLifeCycleService?.onBeforeListenChatCore?.(
          param,
        );
      if (res?.abortListen) {
        abort = true;
      }
    }
    return abort;
  }
}
