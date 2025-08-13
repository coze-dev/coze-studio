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

import { useMemo } from 'react';

import {
  useBuiltinButtonStatus,
  useChatAreaController,
  useClearContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozBroom, IconCozChatPlus } from '@coze-arch/coze-design/icons';

import { IconAddNewConversation } from '@/components/icon/add-new-conversation';

import { useChatAppProps } from '../store';

export type ChatOp = 'clearContext' | 'clearMessage' | 'addNewConversation';
export interface ButtonProps {
  icon?: React.ReactNode;
  text?: string | React.ReactNode;
  disabled?: boolean;
  onClick?: (event?: React.MouseEvent) => void;
}
export const useChatOpInfo = () => {
  const { chatConfig } = useChatAppProps();
  const chatInputLeftOps: ChatOp[] = [];
  const headerTopLeftOps: ChatOp[] = [];
  console.log('useChatOpInfo:', chatConfig);
  if (chatConfig?.ui?.header?.isShow) {
    if (chatConfig?.ui?.chatBot?.isNeedClearContext) {
      chatInputLeftOps.push('clearContext');

      if (chatConfig?.ui?.chatBot?.isNeedClearMessage) {
        headerTopLeftOps.push('clearMessage');
      } else if (chatConfig?.ui?.chatBot?.isNeedAddNewConversation) {
        headerTopLeftOps.push('addNewConversation');
      }
    } else {
      // 在实际使用中， clearMessage 和 addNewConversation 不会同时出现，两个功能是重复的，只是为了区分按钮的样式
      if (chatConfig?.ui?.chatBot?.isNeedClearMessage) {
        chatInputLeftOps.push('clearMessage');
      } else if (chatConfig?.ui?.chatBot?.isNeedAddNewConversation) {
        chatInputLeftOps.push('addNewConversation');
      }
    }
  } else {
    if (chatConfig?.ui?.chatBot?.isNeedClearContext) {
      chatInputLeftOps.push('clearContext');
    }
    // 在实际使用中， clearMessage 和 addNewConversation 不会同时出现，两个功能是重复的，只是为了区分按钮的样式
    if (chatConfig?.ui?.chatBot?.isNeedClearMessage) {
      chatInputLeftOps.push('clearMessage');
    } else if (chatConfig?.ui?.chatBot?.isNeedAddNewConversation) {
      chatInputLeftOps.push('addNewConversation');
    }
  }
  return {
    chatInputLeftOps,
    headerTopLeftOps,
  };
};
export const useChatChatButtonInfo = (opList: ChatOp[]) => {
  const { isClearHistoryButtonDisabled, isClearContextButtonDisabled } =
    useBuiltinButtonStatus({});
  const { readonly } = useChatAppProps();
  const { clearHistory } = useChatAreaController();
  const clearContext = useClearContext();
  const buttonList = useMemo<ButtonProps[]>(
    () =>
      opList.map(item => {
        if (item === 'addNewConversation') {
          return {
            icon: <IconAddNewConversation width="18px" height="18px" />,
            text: I18n.t('web_sdk_add_new_conversation'),
            disabled: isClearHistoryButtonDisabled || readonly,
            onClick: () => {
              clearHistory?.();
            },
          };
        } else if (item === 'clearContext') {
          return {
            icon: <IconCozChatPlus width="18px" height="18px" />,
            text: I18n.t('store_start_new_chat'),
            disabled: isClearContextButtonDisabled || readonly,
            onClick: () => {
              clearContext();
            },
          };
        } else {
          return {
            icon: <IconCozBroom width="18px" height="18px" />,
            text: I18n.t('coze_home_delete_btn'),
            disabled: isClearHistoryButtonDisabled || readonly,
            onClick: () => {
              clearHistory?.();
            },
          };
        }
      }),
    [
      opList,
      isClearContextButtonDisabled,
      isClearHistoryButtonDisabled,
      readonly,
      clearHistory,
      clearContext,
    ],
  );
  return buttonList;
};
