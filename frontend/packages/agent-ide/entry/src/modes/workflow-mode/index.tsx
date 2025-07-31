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
import { ResizableLayout } from '@coze-studio/components';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import {
  IconBotMultiLeftBtnIcon,
  IconBotMultiRightBtnIcon,
} from '@coze-arch/bot-icons';
import { LayoutContext, PlacementEnum } from '@coze-arch/bot-hooks';
import { BotMode, TabStatus } from '@coze-arch/bot-api/developer_api';
import { WorkflowConfigArea } from '@coze-agent-ide/workflow';
import { ToolGroupKey } from '@coze-agent-ide/tool-config';
import {
  GroupingContainer,
  AbilityAreaContainer,
  ToolKey,
  ToolView,
} from '@coze-agent-ide/tool';
import { useBotPageStore } from '@coze-agent-ide/space-bot/store';
import {
  DataMemory,
  settingAreaScrollId,
  ChatBackground,
  SheetView,
  ContentView,
  BotDebugPanel,
} from '@coze-agent-ide/space-bot/component';
import { OnboardingMessage } from '@coze-agent-ide/onboarding-message-adapter';
import { BotDebugChatArea } from '@coze-agent-ide/chat-debug-area';
import { BotConfigArea } from '@coze-agent-ide/bot-config-area-adapter';

import s from '../../index.module.less';
export interface WorkflowModeProps {
  rightSheetSlot?: ReactNode;
  memoryToolSlot?: ReactNode;
  dialogToolSlot?: ReactNode;
  renderChatTitleNode?: (params: {
    pageFrom: BotPageFromEnum | undefined;
    showBackground: boolean;
  }) => ReactNode;
  chatSlot?: ReactNode;
  chatHeaderClassName?: string;
  chatAreaReadOnly?: boolean;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const WorkflowMode: React.FC<WorkflowModeProps> = ({
  rightSheetSlot,
  memoryToolSlot,
  dialogToolSlot,
  renderChatTitleNode,
  chatSlot,
  chatHeaderClassName,
  chatAreaReadOnly,
}) => {
  const { isInit, editable, historyVisible, pageFrom, defaultAllHidden } =
    usePageRuntimeStore(
      useShallow(state => ({
        editable: state.editable,
        isInit: state.init,
        historyVisible: state.historyVisible,
        pageFrom: state.pageFrom,
        defaultAllHidden: !Object.values(
          state.botSkillBlockCollapsibleState,
        ).some(val => val !== TabStatus.Hide),
      })),
    );
  const { showBackground } = useBotSkillStore(
    useShallow(({ backgroundImageInfoList }) => ({
      showBackground: Boolean(
        backgroundImageInfoList?.[0]?.mobile_background_image?.origin_image_url,
      ),
    })),
  );

  const modeSwitching = useBotPageStore(state => state.bot.modeSwitching);

  const isReadonly = useBotDetailIsReadonly();

  const toolArea = (
    <div className="overflow-hidden h-full flex">
      <LayoutContext value={{ placement: PlacementEnum.CENTER }}>
        <div
          className={classNames(s['setting-area'], 'coz-bg-plus', {
            [s['tool-hidden']]: defaultAllHidden,
          })}
        >
          <div
            className="px-[28px] py-[16px] overflow-auto flex-1"
            id={settingAreaScrollId}
          >
            <ToolView>
              <WorkflowConfigArea />
              <div className="mx-[-28px] my-[16px] border-0 border-b border-solid coz-stroke-primary" />
              <GroupingContainer
                toolGroupKey={ToolGroupKey.MEMORY}
                title={I18n.t('bot_edit_type_memory')}
              >
                {/* variable storage */}
                <DataMemory
                  toolKey={ToolKey.VARIABLE}
                  title={I18n.t('user_profile')}
                />
                {memoryToolSlot}
              </GroupingContainer>
              <GroupingContainer
                toolGroupKey={ToolGroupKey.DIALOG}
                title={I18n.t('bot_edit_type_dialog')}
              >
                {/* opening statement */}
                <OnboardingMessage
                  toolKey={ToolKey.ONBOARDING}
                  title={I18n.t('bot_preview_opening_remarks')}
                />
                {/* Chat background image */}
                <ChatBackground
                  toolKey={ToolKey.BACKGROUND}
                  title={I18n.t('bgi_title')}
                />
                {dialogToolSlot}
              </GroupingContainer>
            </ToolView>
          </div>
        </div>
      </LayoutContext>
    </div>
  );

  const leftSheet = (
    <SheetView
      headerClassName={classNames([
        'coz-bg-plus',
        'coz-fg-secondary',
        s['sheet-view-left-header'],
        s['sheet-view-new-header'],
      ])}
      mode={BotMode.WorkflowMode}
      title={I18n.t('bot_build_title')}
      titleNode={
        <div className={s['sheet-title-node-cover']}>
          <BotConfigArea pageFrom={pageFrom} editable={editable} />
        </div>
      }
      slideProps={{
        placement: 'left',
        closeBtnTooltip: I18n.t('chatflow_develop_tooltip_hide'),
        openBtnTooltip: I18n.t('chatflow_develop_tooltip_show'),
        width: 400,
        visible: true,
        btnNode: <IconBotMultiLeftBtnIcon />,
      }}
    >
      {toolArea}
    </SheetView>
  );

  const rightSheet = (
    <SheetView
      mode={BotMode.WorkflowMode}
      title={I18n.t('bot_preview_debug_title')}
      titleClassName={showBackground ? '!coz-fg-images-white' : ''}
      containerClassName={classNames(
        s['bj-cover'],
        showBackground && `${s['bj-img-cover']} `,
        s['bj-single-cover'],
      )}
      headerClassName={classNames(
        s['debug-chat-header-padding'],
        `${s['border-cover']}`,
        {
          '!bg-transparent': showBackground,
        },
        chatHeaderClassName,
      )}
      slideProps={{
        placement: 'right',
        closeBtnTooltip: I18n.t('chatflow_preview_tooltip_hide'),
        openBtnTooltip: I18n.t('chatflow_preview_tooltip_show'),
        width: 400,
        visible: true,
        btnNode: <IconBotMultiRightBtnIcon />,
      }}
      titleNode={renderChatTitleNode?.({ pageFrom, showBackground })}
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
        isReadonly={isReadonly}
        mode={BotMode.WorkflowMode}
        modeSwitching={modeSwitching}
        isInit={isInit}
      >
        <ContentView mode={BotMode.WorkflowMode}>
          <ResizableLayout
            className="h-full"
            hotZoneClassName={s['layout-hotzone']}
          >
            <div className="w-1/2 min-w-[610px]">{leftSheet}</div>
            <div className="w-1/2 min-w-[480px]">{rightSheet}</div>
          </ResizableLayout>
        </ContentView>

        {/* Debug bench */}
        <BotDebugPanel />
        {rightSheetSlot}
      </AbilityAreaContainer>
    </div>
  );
};
