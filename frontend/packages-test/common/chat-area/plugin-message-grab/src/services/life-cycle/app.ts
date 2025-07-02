import { type GrabNode } from '@coze-common/text-grab';
import { WriteableAppLifeCycleService } from '@coze-common/chat-area';

import {
  PublicEventNames,
  type GrabPluginBizContext,
} from '../../types/plugin-biz-context';

export class GrabAppLifeCycleService extends WriteableAppLifeCycleService<GrabPluginBizContext> {
  onBeforeDestroy(): void {
    const { unsubscribe, eventCenter, publicEventCenter, scene } =
      this.pluginInstance.pluginBizContext;

    // Store 历史逻辑有一些问题，导致调用了 多次 destroy 但未初始化的情况，就不走下面的强制清理流程，而是走组件生命周期销毁
    if (scene === 'store') {
      return;
    }

    unsubscribe();
    eventCenter.all.clear();
    publicEventCenter.all.clear();
  }
  onBeforeInitial(): void {
    const {
      publicEventCenter,
      grabPluginId: currentGrabPluginId,
      storeSet,
    } = this.pluginInstance.pluginBizContext;

    const { useQuoteStore } = storeSet;

    const { updateQuoteContent, updateQuoteVisible } = useQuoteStore.getState();

    publicEventCenter.on(
      PublicEventNames.UpdateQuote,
      ({
        grabPluginId,
        quote,
      }: {
        grabPluginId: string;
        quote: GrabNode[] | null;
      }) => {
        if (currentGrabPluginId !== grabPluginId) {
          return;
        }

        updateQuoteContent(quote);
        updateQuoteVisible(true);
      },
    );
  }
}
