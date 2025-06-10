// TODO: hzf header耦合dev模式多人协作等逻辑，dev后续不维护了，后续可以抽离，不应该耦合逻辑

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
        {/** 1. 左侧bot信息区 */}
        <div className="flex items-center">
          <BackButton onClickBack={goBackToBotList} />
          <BotInfoCard
            isReadonly={isReadonly}
            editBotInfoFn={editBotInfoFn}
            deployButton={props.deployButton}
          />
          {/** 模式选择器 */}
          {diffTask || IS_OPEN_SOURCE ? null : (
            <ModeSelect optionList={props.modeOptionList} />
          )}
        </div>

        {/* 2. 中间bot菜单区 - 已下线 */}

        {/* 3. 右侧bot状态区 */}
        {props.addonAfter}
        {updateBotModal}
      </div>
    </>
  );
};
