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
 
import React, {
  useEffect,
  useMemo,
  lazy,
  Suspense,
  type ReactNode,
  forwardRef,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { debounce, isFunction } from 'lodash-es';
import { produce } from 'immer';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  botSkillSaveManager,
  useBotDetailIsReadonly,
} from '@coze-studio/bot-detail-store';
import { OpenBlockEvent } from '@coze-arch/bot-utils';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Spin } from '@coze-arch/bot-semi';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { ItemType } from '@coze-arch/bot-api/developer_api';
import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import {
  BotCreatorScene,
  useBotCreatorContext,
} from '@coze-agent-ide/bot-creator-context';

import { SuggestionList } from './suggestion-list';
import { useSubmitEditor } from './onboarding-editor/hooks/use-submit-editor';
import { type OnboardingEditorAction } from './onboarding-editor';
import { EditorExpendModal } from './editor-expend-modal';
import { settingAreaScrollId } from './const';
const OnboardingEditor = lazy(() => import('./onboarding-editor'));

export {
  SuggestionList,
  EditorExpendModal,
  settingAreaScrollId,
  type OnboardingEditorAction,
};

type IOnboardingMessageProps = ToolEntryCommonProps & {
  actionButton?: ReactNode;
  isLoading?: boolean;
};

const eventWaitTime = 5000;

export const OnboardingMessage = forwardRef<
  OnboardingEditorAction,
  IOnboardingMessageProps
>(({ title, actionButton, isLoading }, ref) => {
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );
  const { scene } = useBotCreatorContext();
  const { onboardingContent, updateSkillOnboarding } = useBotSkillStore(
    useShallow(state => ({
      onboardingContent: state.onboardingContent,
      updateSkillOnboarding: state.updateSkillOnboarding,
    })),
  );

  const setToolValidData = useToolValidData();

  const isReadonly = useBotDetailIsReadonly();
  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.ONBORDING_MESSAGE_BLOCK,
    configured:
      onboardingContent.prologue.length > 0 ||
      onboardingContent.suggested_questions.length > 1,
  });

  const [submitEditor] = useSubmitEditor();

  const sendEvent = useMemo(
    () =>
      debounce((type: 'welcome_message' | 'suggestion') => {
        sendTeaEvent(EVENT_NAMES.click_welcome_message_edit, {
          type,
          bot_id: botId,
        });
      }, eventWaitTime),
    [botId],
  );

  useEffect(() => {
    setToolValidData(
      Boolean(
        onboardingContent.prologue ||
          onboardingContent.suggested_questions?.some?.(q => q.content),
      ),
    );
  }, [onboardingContent]);

  return (
    <>
      <ToolContentBlock
        blockEventName={OpenBlockEvent.ONBORDING_MESSAGE_BLOCK_OPEN}
        header={title}
        showBottomBorder
        defaultExpand={defaultExpand}
        actionButton={actionButton}
      >
        <Suspense fallback={<Spin />}>
          <OnboardingEditor
            ref={ref}
            initValues={onboardingContent}
            isReadonly={isReadonly}
            isGenerating={isLoading}
            // 社区版暂不支持该功能
            plainText={scene === BotCreatorScene.DouyinBot}
            onChange={submitEditor}
            onBlur={() => {
              botSkillSaveManager.saveFlush(ItemType.ONBOARDING);
            }}
          />
        </Suspense>
        <SuggestionList
          isReadonly={isReadonly}
          initValues={onboardingContent}
          onBlur={() => {
            botSkillSaveManager.saveFlush(ItemType.ONBOARDING);
          }}
          onChange={update => {
            updateSkillOnboarding(pre => {
              sendEvent('suggestion');
              return produce(pre, isFunction(update) ? update : () => update);
            });
          }}
        />
      </ToolContentBlock>
    </>
  );
});
