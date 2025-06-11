import { type ReadonlyAppLifeCycleServiceGenerator } from '@coze-common/chat-area';

import {
  ChatBackgroundEventName,
  type BackgroundPluginBizContext,
} from '../../types/biz-context';

export const bizAppLifeCycleService: ReadonlyAppLifeCycleServiceGenerator<
  BackgroundPluginBizContext
> = plugin => ({
  onBeforeInitial: () => {
    const { chatBackgroundEvent, storeSet } = plugin.pluginBizContext;

    const { setBackgroundInfo } = storeSet.useChatBackgroundContext.getState();

    chatBackgroundEvent.on(
      ChatBackgroundEventName.OnBackgroundChange,
      backgroundInfo => {
        setBackgroundInfo(backgroundInfo);
      },
    );
  },

  onAfterInitial: ctx => {
    const { setBackgroundInfo, clearBackgroundStore } =
      plugin.pluginBizContext.storeSet.useChatBackgroundContext.getState();
    const ctxBackgroundInfo = ctx.messageListFromService.backgroundInfo;
    if (ctxBackgroundInfo) {
      setBackgroundInfo(ctxBackgroundInfo);
    } else {
      clearBackgroundStore();
    }
  },

  onBeforeDestroy: () => {
    const { chatBackgroundEvent } = plugin.pluginBizContext;
    chatBackgroundEvent.all.clear();
  },
});
