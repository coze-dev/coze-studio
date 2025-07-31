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
