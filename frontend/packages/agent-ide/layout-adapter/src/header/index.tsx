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

import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Divider } from '@coze-arch/bot-semi';
import { DuplicateBot } from '@coze-studio/components';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { Tag } from '@coze-arch/coze-design';
import {
  type BotHeaderProps,
  DeployButton,
  MoreMenuButton,
  OriginStatus,
  AgentHistoryButton,
  AgentHistoryDrawer,
  useAgentHistoryAction,
} from '@coze-agent-ide/layout';

export type HeaderAddonAfterProps = Omit<
  BotHeaderProps,
  'modeOptionList' | 'deployButton'
>;

export const HeaderAddonAfter: React.FC<HeaderAddonAfterProps> = ({
  isEditLocked,
}) => {
  const [visible, setVisible] = useState(false);
  const isReadonly = useBotDetailIsReadonly();
  const editable = usePageRuntimeStore(state => state.editable);
  const isPreview = usePageRuntimeStore(state => state.isPreview);
  const setPageRuntimeBotInfo = usePageRuntimeStore(state => state.setPageRuntimeBotInfo);
  const { botId, spaceId, botInfo } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      spaceId: state.space_id,
      botInfo: state,
    })),
  );

  const { showCurrent } = useAgentHistoryAction();

  const openHistory = useCallback(() => {
    setVisible(true);
    // 标记为历史视图展开，影响布局和交互
    setPageRuntimeBotInfo({ historyVisible: true });
  }, [setPageRuntimeBotInfo]);

  const closeHistory = useCallback(() => {
    setVisible(false);
    // 关闭历史抽屉后恢复草稿最新内容（服务端查询）
    // 同时还原布局标识
    setPageRuntimeBotInfo({ historyVisible: false });
    // 异步恢复到草稿（不限制光标位置）
    if (usePageRuntimeStore.getState().isPreview) {
      void showCurrent();
    }
  }, [setPageRuntimeBotInfo, showCurrent]);
  return (
    <div className="flex items-center gap-2">
      {/** 3.1 State Zone */}
      <div className="flex items-center gap-2">
        {/*  3.1.1 Draft Status | Collaboration Status */}
        {!isReadonly ? <OriginStatus /> : null}
        {/* 历史版本预览提示（只在预览态展示）*/}
        {isPreview ? (
          <Tag color="orange" size="small">历史版本预览中（只读）</Tag>
        ) : null}
      </div>
      {/** TODO: hzf implicitly associated button, which can be extracted later */}
      {editable ? (
        <Divider layout="vertical" style={{ height: '20px' }} />
      ) : null}
      {/** 3.2 Button area */}
      <div className="flex items-center gap-2">
        {!isEditLocked ? (
          <>
            <div className="flex items-center gap-2">
              {/** Function button area */}
              <AgentHistoryButton onClick={openHistory} />
              <MoreMenuButton />
            </div>
            {/** Submit post related button */}
            <div className="flex items-center gap-2">
              {editable ? <DeployButton /> : null}
              {!editable && botInfo && botId ? (
                <DuplicateBot botID={botId} />
              ) : null}
              <div id="diff-task-button-container"></div>
            </div>
          </>
        ) : (
          <AgentHistoryButton onClick={openHistory} />
        )}
      </div>
      <AgentHistoryDrawer
        botId={botId}
        spaceId={spaceId}
        visible={visible}
        onClose={closeHistory}
      />
    </div>
  );
};
