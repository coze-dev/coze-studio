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
import { isWriteablePlugin } from '../../utils/is-writeable-plugin';
import {
  type OnImageClickContext,
  type OnBeforeClearContextContext,
  type OnOnboardingSelectChangeContext,
  type OnSelectionChangeContext,
  type OnStopRespondingErrorContext,
  type OnInputPasteContext,
  type OnLinkElementContext,
  type OnImageElementContext,
  type OnAfterStopRespondingContext,
  type OnMessageLinkClickContext,
} from '../../types/plugin-class/command-life-cycle';
import { type LifeCycleContext } from '../../types';
import { type CommandLifeCycle, LifeCycleScope } from '../../constants/plugin';
import { proxyFreeze } from '../../../utils/proxy-freeze';

type Expect<T extends true> = T;

type TestClassIncludeCommandLifeCycleKeys =
  CommandLifeCycle extends keyof SystemCommandLifeCycleService ? true : false;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars -- detect type usage
type _ = Expect<TestClassIncludeCommandLifeCycleKeys>;

export class SystemCommandLifeCycleService {
  private lifeCycleContext: LifeCycleContext;

  constructor(lifeCycleContext: LifeCycleContext) {
    this.lifeCycleContext = lifeCycleContext;
  }

  async onBeforeClearContext({ ctx }: { ctx: OnBeforeClearContextContext }) {
    const lifeCycleName: CommandLifeCycle = 'onBeforeClearContext';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnBeforeClearContext Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    let proxyFreezeContext = proxyFreeze(ctx);
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      if (isWriteablePlugin(plugin)) {
        const newContext =
          await plugin.lifeCycleServices?.commandLifeCycleService?.onBeforeClearContext?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          continue;
        }

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        await plugin.lifeCycleServices?.commandLifeCycleService?.onBeforeClearContext?.(
          proxyFreezeContext,
        );
      }
      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnBeforeClearContext End
     */

    return proxyFreezeContext;
  }

  async onAfterClearContext() {
    const lifeCycleName: CommandLifeCycle = 'onAfterClearContext';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnAfterClearContext Start
     */
    const { pluginInstanceList } = usePluginStore.getState();
    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.commandLifeCycleService?.onAfterClearContext?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnAfterClearContext End
     */
  }

  async onBeforeClearHistory() {
    const lifeCycleName: CommandLifeCycle = 'onBeforeClearHistory';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnBeforeClearHistory Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.commandLifeCycleService?.onBeforeClearHistory?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnBeforeClearHistory End
     */
  }

  async onAfterClearHistory() {
    const lifeCycleName: CommandLifeCycle = 'onAfterClearHistory';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnAfterClearHistory Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.commandLifeCycleService?.onAfterClearHistory?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnAfterClearHistory End
     */
  }

  async onBeforeStopResponding() {
    const lifeCycleName: CommandLifeCycle = 'onBeforeStopResponding';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnBeforeStopResponding Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.commandLifeCycleService?.onBeforeStopResponding?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnBeforeStopResponding End
     */
  }

  async onAfterStopResponding({ ctx }: { ctx: OnAfterStopRespondingContext }) {
    const lifeCycleName: CommandLifeCycle = 'onAfterStopResponding';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnAfterStopResponding Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.commandLifeCycleService?.onAfterStopResponding?.(
        ctx,
      );
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleStart();
    /**
     * CycleLife - Command - OnAfterStopResponding End
     */
  }

  async onClearContextError() {
    const lifeCycleName: CommandLifeCycle = 'onBeforeClearContext';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnClearContextError Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();
    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.commandLifeCycleService?.onClearContextError?.();
      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnClearContextError End
     */
  }

  async onImageClick({ ctx }: { ctx: OnImageClickContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - OnImageClick Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      await plugin.lifeCycleServices?.commandLifeCycleService?.onImageClick?.(
        proxyFreezeContext,
      );
    }
    /**
     * CycleLife - Command - OnImageClick End
     */
  }

  async onInputClick() {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - OnInputClick Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      await plugin.lifeCycleServices?.commandLifeCycleService?.onInputClick?.();
    }
    /**
     * CycleLife - Command - OnInputClick End
     */
  }

  async onOnboardingSelectChange({
    ctx,
  }: {
    ctx: OnOnboardingSelectChangeContext;
  }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - OnOnboardingSelectChange Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      await plugin.lifeCycleServices?.commandLifeCycleService?.onOnboardingSelectChange?.(
        proxyFreezeContext,
      );
    }

    /**
     * CycleLife - Command - OnOnboardingSelectChange End
     */
  }

  async onSelectionChange({ ctx }: { ctx: OnSelectionChangeContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - OnSelectionChange Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      await plugin.lifeCycleServices?.commandLifeCycleService?.onSelectionChange?.(
        proxyFreezeContext,
      );
    }
    /**
     * CycleLife - Command - OnSelectionChange End
     */
  }

  async onStopRespondingError({ ctx }: { ctx: OnStopRespondingErrorContext }) {
    const lifeCycleName: CommandLifeCycle = 'onStopRespondingError';
    const lifeCycleScope = LifeCycleScope.Command;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Command - OnStopRespondingError Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);

      await plugin.lifeCycleServices?.commandLifeCycleService?.onStopRespondingError?.(
        ctx,
      );

      pluginBenchmark?.recordPluginEnd(plugin);
    }
    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Command - OnStopRespondingError End
     */
  }

  async onInputPaste({ ctx }: { ctx: OnInputPasteContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onInputPaste Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      await plugin.lifeCycleServices?.commandLifeCycleService?.onInputPaste?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onInputPaste End
     */
  }

  onViewScroll() {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onViewScroll Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onViewScroll?.();
    }
    /**
     * CycleLife - Command - onViewScroll End
     */
  }

  onCardLinkElementMouseEnter({ ctx }: { ctx: OnLinkElementContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onCardLinkElementMouseEnter Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onCardLinkElementMouseEnter?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onCardLinkElementMouseEnter End
     */
  }

  onCardLinkElementMouseLeave({ ctx }: { ctx: OnLinkElementContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onCardLinkElementMouseLeave Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onCardLinkElementMouseLeave?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onCardLinkElementMouseLeave End
     */
  }

  onMdBoxImageElementMouseEnter({ ctx }: { ctx: OnImageElementContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onMdBoxImageElementMouseEnter Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onMdBoxImageElementMouseEnter?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onMdBoxImageElementMouseEnter End
     */
  }

  onMdBoxImageElementMouseLeave({ ctx }: { ctx: OnImageElementContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onMdBoxImageElementMouseLeave Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onMdBoxImageElementMouseLeave?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onMdBoxImageElementMouseLeave End
     */
  }

  onMdBoxLinkElementMouseEnter({ ctx }: { ctx: OnLinkElementContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onMdBoxLinkElementMouseEnter Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onMdBoxLinkElementMouseEnter?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onMdBoxLinkElementMouseEnter End
     */
  }

  onMdBoxLinkElementMouseLeave({ ctx }: { ctx: OnLinkElementContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Command - onMdBoxLinkElementMouseLeave Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onMdBoxLinkElementMouseLeave?.(
        ctx,
      );
    }
    /**
     * CycleLife - Command - onMdBoxLinkElementMouseLeave End
     */
  }

  onMessageLinkClick({ ctx }: { ctx: OnMessageLinkClickContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    const { pluginInstanceList } = usePluginStore.getState();

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.commandLifeCycleService?.onMessageLinkClick?.(
        ctx,
      );
    }
  }
}
