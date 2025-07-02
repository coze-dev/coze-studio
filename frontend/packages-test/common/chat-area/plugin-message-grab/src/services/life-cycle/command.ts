import {
  type OnImageElementContext,
  WriteableCommandLifeCycleService,
  type OnLinkElementContext,
} from '@coze-common/chat-area';

import {
  EventNames,
  type GrabPluginBizContext,
} from '../../types/plugin-biz-context';

export class GrabCommandLifeCycleService extends WriteableCommandLifeCycleService<GrabPluginBizContext> {
  onViewScroll(): void {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnViewScroll);
  }
  onCardLinkElementMouseEnter(ctx: OnLinkElementContext) {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnLinkElementMouseEnter, {
      ...ctx,
      type: 'image',
    });
  }
  onCardLinkElementMouseLeave(ctx: OnLinkElementContext) {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnLinkElementMouseLeave, {
      ...ctx,
      type: 'image',
    });
  }
  onMdBoxImageElementMouseEnter(ctx: OnImageElementContext): void {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnLinkElementMouseEnter, {
      ...ctx,
      type: 'image',
    });
  }
  onMdBoxImageElementMouseLeave(ctx: OnImageElementContext): void {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnLinkElementMouseLeave, {
      ...ctx,
      type: 'image',
    });
  }
  onMdBoxLinkElementMouseEnter(ctx: OnLinkElementContext): void {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnLinkElementMouseEnter, {
      ...ctx,
      type: 'link',
    });
  }
  onMdBoxLinkElementMouseLeave(ctx: OnLinkElementContext): void {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnLinkElementMouseLeave, {
      ...ctx,
      type: 'link',
    });
  }
}
