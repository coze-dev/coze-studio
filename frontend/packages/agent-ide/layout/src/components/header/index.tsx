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

import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { type ReactNode, useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { cloneDeep } from 'lodash-es';
import cx from 'classnames';
import { useUpdateAgent } from '@coze-studio/entity-adapter';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useDiffTaskStore } from '@coze-studio/bot-detail-store/diff-task';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { BackButton } from '@coze-foundation/layout';
import { type SenderInfo, useBotInfo } from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type DraftBot } from '@coze-arch/bot-api/developer_api';
import {
  ModeSelect,
  type ModeSelectProps,
} from '@coze-agent-ide/space-bot/component';

import { BotInfoCard } from './bot-info-card';

import s from './index.module.less';

export interface BotHeaderProps {
  pageName?: string;
  isEditLocked?: boolean;
  addonAfter?: ReactNode;
  modeOptionList: ModeSelectProps['optionList'];
  deployButton: ReactNode;
}

export const BotHeader: React.FC<BotHeaderProps> = props => {
  const navigate = useNavigate();
  const spaceID = useSpaceStore(state => state.space.id);
  const isReadonly = useBotDetailIsReadonly();
  const { pageFrom } = usePageRuntimeStore(
    useShallow(state => ({
      pageFrom: state.pageFrom,
    })),
  );

  const botInfo = useBotInfoStore();

  const { updateBotInfo } = useBotInfo();

  const botInfoRef = useRef<DraftBot>();

  useEffect(() => {
    botInfoRef.current = botInfo as DraftBot;
  }, [botInfo]);

  const { modal: updateBotModal, startEdit: editBotInfoFn } = useUpdateAgent({
    botInfoRef,
    onSuccess: (
      botID?: string,
      spaceId?: string,
      extra?: {
        botName?: string;
        botAvatar?: string;
      },
    ) => {
      updateBotInfo(oldBotInfo => {
        const botInfoMap = cloneDeep(oldBotInfo);

        if (!botID) {
          return botInfoMap;
        }
        botInfoMap[botID] = {
          url: extra?.botAvatar ?? '',
          nickname: extra?.botName ?? '',
          id: botID,
          allowMention: false,
        } satisfies SenderInfo;

        return botInfoMap;
      });
    },
  });

  const diffTask = useDiffTaskStore(state => state.diffTask);

  const goBackToBotList = () => {
    navigate(`/space/${spaceID}/develop`);
  };

  return (
    <>
      <div className={cx(s.header, 'coz-bg-primary')}>
        {/* page title */}
        <Helmet>
          <title>
            {renderHtmlTitle(
              pageFrom === BotPageFromEnum.Bot
                ? I18n.t('tab_bot_detail', {
                    bot_name: botInfo?.name ?? '',
                  })
                : I18n.t('tab_explore_bot_detail', {
                    bot_name: botInfo?.name ?? '',
                  }),
            )}
          </title>
        </Helmet>
        {/** 1. Left bot information area */}
        <div className="flex items-center">
          <BackButton onClickBack={goBackToBotList} />
          <BotInfoCard
            isReadonly={isReadonly}
            editBotInfoFn={editBotInfoFn}
            deployButton={props.deployButton}
          />
          {/** mode selector */}
          {diffTask || IS_OPEN_SOURCE ? null : (
            <ModeSelect optionList={props.modeOptionList} />
          )}
        </div>

        {/* 2. Middle bot menu area - offline */}

        {/* 3. Right bot state area */}
        {props.addonAfter}
        {updateBotModal}
      </div>
    </>
  );
};
