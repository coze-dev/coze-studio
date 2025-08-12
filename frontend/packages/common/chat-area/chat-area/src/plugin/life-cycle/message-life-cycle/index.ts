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
  type OnBeforeReceiveMessageContext,
  type OnBeforeProcessReceiveMessageContext,
  type OnBeforeMessageGroupListUpdateContext,
  type OnAfterSendMessageContext,
  type OnBeforeSendMessageContext,
  type OnAfterProcessReceiveMessageContext,
  type OnBeforeDeleteMessageContext,
  type OnAfterDeleteMessageContext,
  type OnSendMessageErrorContext,
  type OnDeleteMessageErrorContext,
  type OnBeforeGetMessageHistoryListContext,
  type OnBeforeAppendSenderMessageIntoStore,
  type OnBeforeDistributeMessageIntoMemberSetContent,
  type OnMessagePullingErrorContext,
  type OnMessagePullingSuccessContext,
} from '../../types/plugin-class/message-life-cycle';
import { type LifeCycleContext } from '../../types';
import { LifeCycleScope, type MessageLifeCycle } from '../../constants/plugin';
import { proxyFreeze } from '../../../utils/proxy-freeze';
import { localLog } from '../../../utils/local-log';

type Expect<T extends true> = T;

type TestClassIncludeMessageLifeCycleKeys =
  MessageLifeCycle extends keyof SystemMessageLifeCycleService ? true : false;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars -- detect type usage
type _ = Expect<TestClassIncludeMessageLifeCycleKeys>;

export class SystemMessageLifeCycleService {
  private lifeCycleContext: LifeCycleContext;

  constructor(lifeCycleContext: LifeCycleContext) {
    this.lifeCycleContext = lifeCycleContext;
  }

  async onBeforeGetMessageHistoryList({
    ctx,
  }: {
    ctx: OnBeforeGetMessageHistoryListContext;
  }) {
    const lifeCycleName: MessageLifeCycle = 'onBeforeGetMessageHistoryList';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - onBeforeGetMessageHistoryList Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);

      if (isWriteablePlugin(plugin)) {
        const newContext =
          await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeGetMessageHistoryList?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          pluginBenchmark?.recordPluginEnd(plugin);
          continue;
        }

        localLog(
          `${lifeCycleScope}/${lifeCycleName}/${plugin.pluginName}: newContext ${newContext}`,
        );

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeGetMessageHistoryList?.(
          proxyFreezeContext,
        );
      }

      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Message - onBeforeGetMessageHistoryList End
     */

    return proxyFreezeContext;
  }

  async onBeforeSendMessage({ ctx }: { ctx: OnBeforeSendMessageContext }) {
    const lifeCycleName: MessageLifeCycle = 'onBeforeSendMessage';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - OnBeforeSendMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);

      if (isWriteablePlugin(plugin)) {
        const newContext =
          await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeSendMessage?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          pluginBenchmark?.recordPluginEnd(plugin);
          continue;
        }

        localLog(
          `${lifeCycleScope}/${lifeCycleName}/${plugin.pluginName}: newContext ${newContext}`,
        );

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeSendMessage?.(
          proxyFreezeContext,
        );
      }

      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Message - OnBeforeSendMessage End
     */

    return proxyFreezeContext;
  }

  async onAfterSendMessage({ ctx }: { ctx: OnAfterSendMessageContext }) {
    const lifeCycleName: MessageLifeCycle = 'onAfterSendMessage';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - OnAfterSendMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);

      await plugin.lifeCycleServices?.messageLifeCycleService?.onAfterSendMessage?.(
        proxyFreezeContext,
      );

      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Message - OnAfterSendMessage End
     */
  }

  onBeforeReceiveMessage({ ctx }: { ctx: OnBeforeReceiveMessageContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onBeforeReceiveMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeReceiveMessage?.(
        proxyFreezeContext,
      );
    }

    /**
     * CycleLife - Message - onBeforeReceiveMessage End
     */
    return proxyFreezeContext;
  }

  onBeforeProcessReceiveMessage({
    ctx,
  }: {
    ctx: OnBeforeProcessReceiveMessageContext;
  }) {
    const lifeCycleName: MessageLifeCycle = 'onBeforeProcessReceiveMessage';
    const lifeCycleScope = LifeCycleScope.Message;

    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onBeforeProcessReceiveMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      if (isWriteablePlugin(plugin)) {
        const newContext =
          plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeProcessReceiveMessage?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          continue;
        }

        localLog(
          `${lifeCycleScope}/${lifeCycleName}/${plugin.pluginName}: newContext ${newContext}`,
        );

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeProcessReceiveMessage?.(
          proxyFreezeContext,
        );
      }
    }

    /**
     * CycleLife - Message - onBeforeProcessReceiveMessage End
     */
    return proxyFreezeContext;
  }

  onBeforeMessageGroupListUpdate({
    ctx,
  }: {
    ctx: OnBeforeMessageGroupListUpdateContext;
  }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onBeforeMessageGroupListUpdate Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      if (isWriteablePlugin(plugin)) {
        const newContext =
          plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeMessageGroupListUpdate?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          continue;
        }

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeMessageGroupListUpdate?.(
          proxyFreezeContext,
        );
      }
    }

    /**
     * CycleLife - Message - onBeforeMessageGroupListUpdate End
     */
    return proxyFreezeContext;
  }

  onAfterProcessReceiveMessage({
    ctx,
  }: {
    ctx: OnAfterProcessReceiveMessageContext;
  }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onAfterProcessReceiveMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.messageLifeCycleService?.onAfterProcessReceiveMessage?.(
        proxyFreezeContext,
      );
    }
    /**
     * CycleLife - Message - onAfterProcessReceiveMessage End
     */
  }

  async onBeforeDeleteMessage({ ctx }: { ctx: OnBeforeDeleteMessageContext }) {
    const lifeCycleName: MessageLifeCycle = 'onBeforeDeleteMessage';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - OnBeforeDeleteMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);

      await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeDeleteMessage?.(
        proxyFreezeContext,
      );

      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Message - OnBeforeDeleteMessage End
     */
  }

  async onAfterDeleteMessage({ ctx }: { ctx: OnAfterDeleteMessageContext }) {
    const lifeCycleName: MessageLifeCycle = 'onAfterDeleteMessage';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - OnAfterDeleteMessage Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.messageLifeCycleService?.onAfterDeleteMessage?.(
        proxyFreezeContext,
      );
      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();

    /**
     * CycleLife - Message - OnAfterDeleteMessage End
     */
  }

  async onDeleteMessageError(ctx: OnDeleteMessageErrorContext) {
    const lifeCycleName: MessageLifeCycle = 'onDeleteMessageError';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - OnDeleteMessageErrorContext Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);
      await plugin.lifeCycleServices?.messageLifeCycleService?.onDeleteMessageError?.(
        ctx,
      );
      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Message - OnDeleteMessageErrorContext End
     */
  }

  async onSendMessageError({ ctx }: { ctx: OnSendMessageErrorContext }) {
    const lifeCycleName: MessageLifeCycle = 'onSendMessageError';
    const lifeCycleScope = LifeCycleScope.Message;

    const { reporter, usePluginStore } = this.lifeCycleContext;

    const pluginBenchmark = createPluginBenchmark({
      lifeCycleName,
      lifeCycleScope,
      reporter,
    });

    /**
     * CycleLife - Message - OnSendMessageError Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    pluginBenchmark?.recordLifeCycleStart();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      pluginBenchmark?.recordPluginStart(plugin);

      await plugin.lifeCycleServices?.messageLifeCycleService?.onSendMessageError?.(
        proxyFreezeContext,
      );

      pluginBenchmark?.recordPluginEnd(plugin);
    }

    pluginBenchmark?.recordLifeCycleEnd();
    /**
     * CycleLife - Message - OnSendMessageError End
     */
  }

  onBeforeDistributeMessageIntoMemberSet({
    ctx,
  }: {
    ctx: OnBeforeDistributeMessageIntoMemberSetContent;
  }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onBeforeDistributeMessageIntoMemberSet Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      if (isWriteablePlugin(plugin)) {
        const newContext =
          plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeDistributeMessageIntoMemberSet?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          continue;
        }

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeDistributeMessageIntoMemberSet?.(
          proxyFreezeContext,
        );
      }
    }

    /**
     * CycleLife - Message - onBeforeDistributeMessageIntoMemberSet End
     */

    return proxyFreezeContext;
  }

  async onBeforeAppendSenderMessageIntoStore({
    ctx,
  }: {
    ctx: OnBeforeAppendSenderMessageIntoStore;
  }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onBeforeAppendSenderMessageIntoStore Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    let proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      if (isWriteablePlugin(plugin)) {
        const newContext =
          await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeAppendSenderMessageIntoStore?.(
            proxyFreezeContext,
          );

        if (!newContext) {
          continue;
        }

        proxyFreezeContext = proxyFreeze(newContext);
      } else {
        await plugin.lifeCycleServices?.messageLifeCycleService?.onBeforeAppendSenderMessageIntoStore?.(
          proxyFreezeContext,
        );
      }
    }

    /**
     * CycleLife - Message - onBeforeAppendSenderMessageIntoStore End
     */
    return proxyFreezeContext;
  }

  async onAfterAppendSenderMessageIntoStore({
    ctx,
  }: {
    ctx: OnBeforeAppendSenderMessageIntoStore;
  }) {
    const { usePluginStore } = this.lifeCycleContext;

    /**
     * CycleLife - Message - onAfterAppendSenderMessageIntoStore Start
     */
    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      await plugin.lifeCycleServices?.messageLifeCycleService?.onAfterAppendSenderMessageIntoStore?.(
        proxyFreezeContext,
      );
    }
  }

  onMessagePullingError({ ctx }: { ctx: OnMessagePullingErrorContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.messageLifeCycleService?.onMessagePullingError?.(
        proxyFreezeContext,
      );
    }
  }

  onMessagePullingSuccess({ ctx }: { ctx: OnMessagePullingSuccessContext }) {
    const { usePluginStore } = this.lifeCycleContext;

    const { pluginInstanceList } = usePluginStore.getState();

    const proxyFreezeContext = proxyFreeze(ctx);

    for (const plugin of pluginInstanceList) {
      plugin.lifeCycleServices?.messageLifeCycleService?.onMessagePullingSuccess?.(
        proxyFreezeContext,
      );
    }
  }
}
