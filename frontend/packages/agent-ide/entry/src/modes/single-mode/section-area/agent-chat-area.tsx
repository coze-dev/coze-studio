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

import { type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { SingleSheet } from '@coze-agent-ide/space-bot/component';
import { I18n } from '@coze-arch/i18n';
import { type BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { BotDebugChatArea } from '@coze-agent-ide/chat-debug-area';

import s from '../../../index.module.less';

export interface AgentChatAreaProps {
  renderChatTitleNode?: (params: {
    pageFrom: BotPageFromEnum | undefined;
    showBackground: boolean;
  }) => ReactNode;
  chatSlot?: ReactNode;
  chatHeaderClassName?: string;
  chatAreaReadOnly?: boolean;
}

export const AgentChatArea: React.FC<AgentChatAreaProps> = ({
  renderChatTitleNode,
  chatSlot,
  chatHeaderClassName,
  chatAreaReadOnly,
}) => {
  const { showBackground } = useBotSkillStore(
    useShallow(({ backgroundImageInfoList }) => ({
      showBackground: Boolean(
        backgroundImageInfoList?.[0]?.mobile_background_image?.origin_image_url,
      ),
    })),
  );

  const { pageFrom } = usePageRuntimeStore(
    useShallow(state => ({
      pageFrom: state.pageFrom,
    })),
  );

  return (
    <SingleSheet
      title={I18n.t('bot_preview_debug_title')}
      titleClassName={classNames(
        showBackground ? '!coz-fg-images-white' : '',
        '!text-[16px]',
      )}
      containerClassName={classNames(
        s['bj-cover'],
        showBackground && `${s['bj-img-cover']}`,
        'flex-none !h-12',
      )}
      headerSlotClassName="!h-12"
      headerClassName={classNames(
        s['debug-chat-header-padding'],
        '!h-12 !text-[16px] !border-0',
        `${s['border-cover']}`,
        {
          '!bg-transparent': showBackground,
        },
        chatHeaderClassName,
      )}
      titleNode={renderChatTitleNode?.({
        pageFrom,
        showBackground,
      })}
      renderContent={headerNode => (
        <div className={classNames(s['message-area'])}>
          <BotDebugChatArea
            headerNode={headerNode}
            readOnly={chatAreaReadOnly}
          />
          {chatSlot}
        </div>
      )}
    />
  );
};
