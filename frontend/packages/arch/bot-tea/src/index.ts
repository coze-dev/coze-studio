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
 
import TeaNew, {
  type EVENT_NAMES,
  type UserGrowthEventParams,
  type ParamsTypeDefine,
} from '@coze-arch/tea';
import { logger } from '@coze-arch/logger';

export {
  EVENT_NAMES,
  AddWorkflowToStoreEntry,
  ExploreBotCardCommonParams,
  ShareRecallPageFrom,
  PluginMockSetCommonParams,
  SideNavClickCommonParams,
  AddPluginToStoreEntry,
  AddBotToStoreEntry,
  PublishAction,
  BotDetailPageAction,
  PluginPrivacyAction,
  PluginMockDataGenerateMode,
  ParamsTypeDefine,
  BotShareConversationClick,
  FlowStoreType,
  FlowResourceFrom,
  FlowDuplicateType,
  /**  product event types */
  ProductEventSource,
  ProductEventFilterTag,
  ProductEventEntityType,
  ProductShowFrontParams,
  DocClickCommonParams,
} from '@coze-arch/tea';

export const LANDING_PAGE_URL_KEY = 'coze_landing_page_url';

/**
 * UG 期望上报的 LandingPageUrl 是“网民最初点击到的页面完整 URL”，
 * 即使打开了新的页面，也应该上报第一次打开的落地页 URL
 * 
 */
export const initBotLandingPageUrl = () => {
  const saved = window.sessionStorage.getItem(LANDING_PAGE_URL_KEY);
  if (!saved) {
    window.sessionStorage.setItem(LANDING_PAGE_URL_KEY, location.href);
  }
};

export const getBotLandingPageUrl = () => {
  const saved = window.sessionStorage.getItem(LANDING_PAGE_URL_KEY);
  return saved ?? location.href;
};

export const sendTeaEvent = <TEventName extends EVENT_NAMES>(
  event: TEventName,
  rawParams?: ParamsTypeDefine[TEventName],
) => {
  let params = rawParams;
  if (FEATURE_ENABLE_TEA_UG) {
    const ugParams: UserGrowthEventParams = {
      LandingPageUrl: getBotLandingPageUrl(),
      // 与 UG 约定的 AppId，固定值
      AppId: 510023,
      EventName: event,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 秒时间戳
      EventTs: Math.floor(Date.now() / 1000),
      growth_deepevent: '4',
    };
    // @ts-expect-error -- UG 额外参数
    params = { ...ugParams, ...(rawParams ?? {}) };
  }
  logger.info({
    message: 'send-tea-event',
    meta: { event, params },
  });
  TeaNew.sendEvent(event, params);
};

