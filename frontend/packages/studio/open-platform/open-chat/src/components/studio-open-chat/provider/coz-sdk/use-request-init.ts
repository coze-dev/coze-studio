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

import { useCallback } from 'react';

import { type ShortCutCommand } from '@coze-common/chat-area-plugins-chat-shortcuts';
import {
  type UserSenderInfo,
  type MixInitResponse,
} from '@coze-common/chat-area';
import i18n from '@coze-arch/i18n/intl';
import { type BotInfo, type CozeAPI } from '@coze/api';

import { type OpenRequestInit, EInputMode } from '@/types/props';

import { useChatAppProps, useChatAppStore } from '../../store';
import { useUserInfo } from '../../hooks';
import {
  convertShortcutData,
  type ShortcutCommandInOpenApi,
} from './helper/convert-shortcut-data';
import { useChatCozeSdk } from './context';
import {
  messageConverterToCoze,
  messageConverterToSdk,
  useGetMessageListByPairs,
} from './api-adapter';
const messageGetLimit = 10;
interface GetRequestInfoProps {
  botId: string;
  cozeApiSdk: CozeAPI;
}

type BotInfoResp = BotInfo & {
  default_user_input_type?: string;
  media_config?: {
    is_voice_call_closed?: boolean;
  };
};
const getBotOnlineInfo = async ({
  botId,
  cozeApiSdk,
}: GetRequestInfoProps & { connectorId: string }): Promise<
  Pick<
    MixInitResponse,
    | 'prologue'
    | 'onboardingSuggestions'
    | 'botVersion'
    | 'botInfoMap'
    | 'backgroundInfo'
  > & {
    defaultInputMode?: EInputMode;
    shortcuts?: ShortCutCommand[];
    isCustomBackground?: boolean;
    voiceCallClose?: boolean;
  }
> => {
  const botRes = await cozeApiSdk.get<
    undefined,
    {
      code: number;
      data: BotInfoResp;
    }
  >(`/v1/bots/${botId}`, undefined, false, {
    headers: {
      'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
    },
  });
  const botInfo = botRes?.data;
  const backgroundInfo: MixInitResponse['backgroundInfo'] =
    botInfo.background_image_info || {};

  // 做兜底处理
  if (backgroundInfo?.web_background_image?.image_url) {
    backgroundInfo.web_background_image.origin_image_url =
      backgroundInfo.web_background_image.origin_image_url ||
      backgroundInfo.web_background_image.image_url;
  }
  if (backgroundInfo?.mobile_background_image?.image_url) {
    backgroundInfo.mobile_background_image.origin_image_url =
      backgroundInfo.mobile_background_image.origin_image_url ||
      backgroundInfo.mobile_background_image.image_url;
  }
  return {
    prologue: botInfo.onboarding_info.prologue,
    onboardingSuggestions:
      botInfo.onboarding_info?.suggested_questions?.map((question, index) => ({
        id: `${index}`,
        content: question,
      })) || [],
    botVersion: botInfo.version,
    botInfoMap: {
      [botInfo.bot_id]: {
        url: botInfo.icon_url,
        nickname: botInfo.name,
        id: botInfo.bot_id,
        allowMention: false,
      },
    },
    backgroundInfo,
    defaultInputMode:
      botInfo.default_user_input_type === 'voice'
        ? EInputMode.Voice
        : botInfo.default_user_input_type === 'call'
          ? EInputMode.VoiceCall
          : EInputMode.Text,
    shortcuts:
      convertShortcutData(
        botInfo.shortcut_commands as unknown as ShortcutCommandInOpenApi[],
        {
          id: botId,
          name: botInfo.name,
          iconUrl: botInfo.icon_url,
        },
      ) || [],
    voiceCallClose: botInfo.media_config?.is_voice_call_closed ?? true,
  };
};
const getConversationInfo = async ({
  botId,
  cozeApiSdk,
  conversationId: conversationIdIn,
  sectionId: sectionIdIn,
  connectorId,
  defaultHistoryMessage,
  onDefaultHistoryClear,
  userInfo,
}: GetRequestInfoProps & {
  conversationId?: string;
  sectionId?: string;
  connectorId: string;
  defaultHistoryMessage?: MixInitResponse['messageList'];
  onDefaultHistoryClear?: () => void;
  userInfo: UserSenderInfo | null;
}): Promise<
  Pick<
    MixInitResponse,
    | 'conversationId'
    | 'messageList'
    | 'hasMore'
    | 'cursor'
    | 'next_cursor'
    | 'lastSectionId'
  >
> => {
  let conversationId: string = conversationIdIn || '';
  let sectionId: string = sectionIdIn || '';
  if (!conversationId) {
    const { data: conversationRes } = (await cozeApiSdk.get(
      '/v1/conversations',
      {
        bot_id: botId,
        connector_id: connectorId,
        page_num: 1,
        page_size: 1,
        user_id: IS_OPEN_SOURCE ? userInfo?.id : undefined,
      },
    )) as {
      data: {
        conversations: {
          id: string;
          last_section_id: string;
        }[];
      };
    };
    let { id: conversationIdNew, last_section_id: sectionIdNew } =
      conversationRes?.conversations?.[0] || {};
    if (!conversationIdNew) {
      const historyMessage = messageConverterToSdk.convertMessageListResponse(
        defaultHistoryMessage,
      );

      try {
        const { id: conversationIdCreated, last_section_id: sectionIdCreated } =
          await cozeApiSdk.conversations.create(
            {
              bot_id: botId,
              messages: historyMessage,
              // @ts-expect-error: connector_id is not in the type
              connector_id: connectorId,
              user_id: IS_OPEN_SOURCE ? userInfo?.id : undefined,
            },
            {
              headers: {
                'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
              },
            },
          );
        conversationIdNew = conversationIdCreated;
        sectionIdNew = sectionIdCreated || '';

        onDefaultHistoryClear?.();
      } catch (err) {
        ///historyMessage 可能导致失败，兜底一下
        const { id: conversationIdCreated, last_section_id: sectionIdCreated } =
          await cozeApiSdk.conversations.create(
            {
              bot_id: botId,
              // @ts-expect-error: connector_id is not in the type
              connector_id: connectorId,
              user_id: IS_OPEN_SOURCE ? userInfo?.id : undefined,
            },
            {
              headers: {
                'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
              },
            },
          );
        conversationIdNew = conversationIdCreated;
        sectionIdNew = sectionIdCreated || '';
      }
    }
    conversationId = conversationIdNew;
    sectionId = sectionIdNew;
  }

  const resMessage = await cozeApiSdk.conversations.messages.list(
    conversationId,
    {
      limit: messageGetLimit,
    },
  );
  const {
    message_list: messageList,
    hasmore: hasMore,
    cursor,
    next_cursor: nextCursor,
  } = messageConverterToCoze.convertMessageListResponse(resMessage, botId);

  return {
    lastSectionId: sectionId,
    conversationId,
    messageList,
    hasMore,
    cursor,
    next_cursor: nextCursor,
  };
};
const getCustomInitInfo = async ({
  cozeApiSdk,
  openRequestInit,
}: {
  cozeApiSdk: CozeAPI;
  openRequestInit?:
    | OpenRequestInit
    | {
        (cozeApi?: CozeAPI): Promise<OpenRequestInit> | OpenRequestInit;
      };
}) => {
  let result: OpenRequestInit;
  if (openRequestInit) {
    if (typeof openRequestInit === 'function') {
      result = await openRequestInit(cozeApiSdk);
    } else {
      result = openRequestInit;
    }
    if (result.isBuilderChat) {
      return {
        botOnlineInfo: {
          prologue: result.prologue,
          onboardingSuggestions: result.onboardingSuggestions,
          botInfoMap: {
            [result.botInfo.id]: result.botInfo,
          },
          backgroundInfo: result.backgroundInfo,
          defaultInputMode: result.defaultInputMode,
          shortcuts: [],
          isCustomBackground: result.isCustomBackground,
        },
        conversationId: result.conversationId,
        sectionId: result.sectionId,
      };
    }
    return {
      conversationId: result.conversationId,
      sectionId: result.sectionId,
    };
  }
  return null;
};

export const useRequestInit = () => {
  const {
    chatConfig,
    openRequestInit,
    defaultHistoryMessage = [],
    onDefaultHistoryClear,
  } = useChatAppProps();

  const { cozeApiSdk } = useChatCozeSdk();
  const setInitError = useChatAppStore(s => s.setInitError);
  const setDefaultInputMode = useChatAppStore(s => s.setDefaultInputMode);
  const updateShortcuts = useChatAppStore(s => s.updateShortcuts);
  const setIsStartBotVoiceCall = useChatAppStore(s => s.setIsStartBotVoiceCall);
  const updateBackgroundInfo = useChatAppStore(s => s.updateBackgroundInfo);

  const getMessageListByPairs = useGetMessageListByPairs();

  const connectorId = chatConfig?.auth?.connectorId || '';
  const { bot_id: botId = '' } = chatConfig;
  const userInfo = useUserInfo();
  const requestToInit = useCallback<
    () => Promise<MixInitResponse>
    // @ts-expect-error -- linter-disable-autofix
  >(async () => {
    if (!cozeApiSdk) {
      return {};
    }
    try {
      const { conversationId, sectionId, botOnlineInfo } =
        (await getCustomInitInfo({
          cozeApiSdk,
          openRequestInit,
        })) || {};

      const [requestDataBotInfo, requestDataConversationInfo] =
        await Promise.all([
          botOnlineInfo || getBotOnlineInfo({ botId, cozeApiSdk, connectorId }),
          getConversationInfo({
            botId,
            cozeApiSdk,
            conversationId,
            sectionId,
            connectorId,
            onDefaultHistoryClear,
            defaultHistoryMessage,
            userInfo,
          }),
        ]);
      const prologue = (requestDataBotInfo.prologue || '').replaceAll(
        '{{user_name}}',
        userInfo?.nickname || '',
      );
      setIsStartBotVoiceCall(
        requestDataBotInfo.defaultInputMode === EInputMode.VoiceCall,
      );
      setDefaultInputMode(
        requestDataBotInfo.defaultInputMode || EInputMode.Text,
      );
      updateShortcuts(requestDataBotInfo.shortcuts || []);
      console.log(
        'requestDataBotInfo.shortcuts:',
        requestDataBotInfo.shortcuts,
      );

      updateBackgroundInfo(requestDataBotInfo.backgroundInfo);
      if (requestDataBotInfo.isCustomBackground) {
        requestDataBotInfo.backgroundInfo = undefined;
      }
      console.log('[result]2:', requestDataBotInfo);
      return {
        ...requestDataBotInfo,
        ...requestDataConversationInfo,
        prologue,
        messageList: getMessageListByPairs(
          requestDataConversationInfo.conversationId || '',
          requestDataConversationInfo.messageList,
        ),
        userInfoMap: userInfo?.id
          ? {
              [userInfo?.id]: userInfo,
            }
          : undefined,
      };
    } catch (e) {
      console.error('useRequestInit error', e);
      const { code } = (e as { code: number; message: string }) || {};
      if (code) {
        setInitError({ code, msg: '' });
      } else {
        setInitError({ code: -1, msg: '' });
      }
    }
  }, [botId, cozeApiSdk, defaultHistoryMessage, onDefaultHistoryClear]);
  return requestToInit;
};
