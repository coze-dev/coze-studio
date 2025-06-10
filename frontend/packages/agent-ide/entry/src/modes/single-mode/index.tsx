import { type ReactNode, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { BotMode, TabStatus } from '@coze-arch/bot-api/developer_api';
import { AbilityAreaContainer } from '@coze-agent-ide/tool';
import { useBotPageStore } from '@coze-agent-ide/space-bot/store';
import {
  ContentView,
  BotDebugPanel,
} from '@coze-agent-ide/space-bot/component';

import s from '../../index.module.less';
import {
  AgentConfigArea,
  type AgentConfigAreaProps,
} from './section-area/agent-config-area/index';
import {
  AgentChatArea,
  type AgentChatAreaProps,
} from './section-area/agent-chat-area';
import { CoachMark } from './components/coach-mark';

export interface SingleModeProps
  extends Omit<AgentConfigAreaProps, 'isAllToolHidden'>,
    AgentChatAreaProps {
  rightSheetSlot?: ReactNode;
  chatAreaReadOnly?: boolean;
}

export const SingleMode: React.FC<SingleModeProps> = ({
  rightSheetSlot,
  renderChatTitleNode,
  chatSlot,
  chatHeaderClassName,
  chatAreaReadOnly,
  ...agentConfigAreaProps
}) => {
  const { isInit, historyVisible, pageFrom, defaultAllHidden } =
    usePageRuntimeStore(
      useShallow(state => ({
        isInit: state.init,
        historyVisible: state.historyVisible,
        pageFrom: state.pageFrom,
        defaultAllHidden: !Object.values(
          state.botSkillBlockCollapsibleState,
        ).some(val => val !== TabStatus.Hide),
      })),
    );

  const modeSwitching = useBotPageStore(state => state.bot.modeSwitching);

  const isReadonly = useBotDetailIsReadonly();

  const [isAllToolHidden, setIsAllToolHidden] = useState(defaultAllHidden);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onAllToolHiddenStatusChange = (_isAllToolHidden: any) => {
    setIsAllToolHidden(_isAllToolHidden);
  };

  return (
    <div
      className={classNames(
        s.container,
        historyVisible && s['playground-neat'],
        pageFrom === BotPageFromEnum.Store && s.store,
      )}
    >
      <AbilityAreaContainer
        enableToolHiddenMode
        eventCallbacks={{
          onAllToolHiddenStatusChange,
        }}
        isReadonly={isReadonly}
        mode={BotMode.SingleMode}
        modeSwitching={modeSwitching}
        isInit={isInit}
      >
        <ContentView
          mode={BotMode.SingleMode}
          className={classNames({
            [s['wrapper-single-with-tool-area-hidden']]: isAllToolHidden,
          })}
        >
          <AgentConfigArea
            isAllToolHidden={isAllToolHidden}
            {...agentConfigAreaProps}
          />
          <AgentChatArea
            renderChatTitleNode={renderChatTitleNode}
            chatSlot={chatSlot}
            chatHeaderClassName={chatHeaderClassName}
            chatAreaReadOnly={chatAreaReadOnly}
          />
        </ContentView>

        {/* Debug调试台 */}
        <BotDebugPanel />
        {rightSheetSlot}
        <CoachMark />
      </AbilityAreaContainer>
    </div>
  );
};
