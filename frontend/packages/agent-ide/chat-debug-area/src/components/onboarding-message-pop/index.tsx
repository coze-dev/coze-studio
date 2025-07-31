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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useDebounce, useSize, useUpdateEffect } from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import { useReportTti } from '@coze-arch/report-tti';
import {
  BotMode,
  SuggestedQuestionsShowMode,
} from '@coze-arch/bot-api/developer_api';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useChatBackgroundState } from '@coze-studio/bot-detail-store';
import {
  CozeImageWithPreview,
  CozeLink,
  LazyCozeMdBox,
  MessageBox,
  NO_MESSAGE_ID_MARK,
  OnBoarding as UIKitOnBoarding,
} from '@coze-common/chat-uikit';
import {
  type ComponentTypesMap,
  useOnboardingCenterOffset,
} from '@coze-common/chat-area';
import {
  ONBOARDING_PREVIEW_DELAY,
  OnboardingVariable,
  useRenderVariable,
} from '@coze-agent-ide/onboarding';

import s from './index.module.less';
/**
 * When there is a state change with or without the opening line, it will reflow and change the height in sequence. After the useSize listens to the change, the marginTop change triggers a repaint, resulting in two renders, resulting in jitter.
 * Now we need to reconcile these two renders
 * It is necessary to optimize the onboarding dom structure so that the centering ability of onboarding is implemented by css to solve this problem
 *                       not-needed
 *                           |
 *                           |
 * ready-empty-onboarding <--+--> ready-onboarding
 *      |                                 |
 *      |                                 v
 * harmonized-empty-onboarding       harmonized-onboarding
 *      |                                 |
 *      v                                 |
 *    not-needed <------------------------+
 */
type HarmonizeOnboardingRender =
  | 'not-needed'
  | 'ready-empty-onboarding'
  | 'ready-onboarding'
  | 'harmonized-onboarding'
  | 'harmonized-empty-onboarding';

const getHarmonizedOnboardingHeight = ({
  onboardingHeight = 0,
  status,
}: {
  onboardingHeight?: number;
  status: HarmonizeOnboardingRender;
}) => {
  const emptyOnboardingHeight = 56;
  const contentOnboardingHeight = 118;
  switch (status) {
    case 'not-needed':
      return onboardingHeight;
    case 'ready-onboarding':
    case 'harmonized-onboarding':
      return contentOnboardingHeight;
    default:
      return emptyOnboardingHeight;
  }
};

export const OnboardingMessagePop: ComponentTypesMap['onboarding'] = ({
  prologue,
  suggestions,
  sendTextMessage,
  hasMessages,
  enableImageAutoSize,
  imageAutoSizeContainerWidth,
  showBackground: showBackgroundProp,
  eventCallbacks,
}) => {
  const [harmonizeRenders, setHarmonizeRenders] =
    useState<HarmonizeOnboardingRender>('not-needed');

  const ref = useRef<HTMLDivElement>(null);
  const onboardingSize = useSize(ref);
  const {
    avatar,
    name,
    mode,
    id = '',
  } = useBotInfoStore(
    useShallow(state => ({
      mode: state.mode,
      avatar: state.icon_url,
      name: state.name,
      id: state.botId,
    })),
  );
  const { onBoardingSuggestionWrap } = useBotSkillStore(
    useShallow(state => ({
      onBoardingSuggestionWrap:
        state.onboardingContent.suggested_questions_show_mode ===
        SuggestedQuestionsShowMode.All,
    })),
  );
  const debouncedPrologue = useDebounce(prologue, {
    wait: ONBOARDING_PREVIEW_DELAY,
  });
  const userInfo = userStoreService.useUserInfo();
  const { showBackground: showBackgroundFromChatBackgroundState } =
    useChatBackgroundState();
  const showBackground =
    showBackgroundProp ?? showBackgroundFromChatBackgroundState;

  const renderVariable = useRenderVariable({
    [OnboardingVariable.USER_NAME]: userInfo?.name ?? '',
  });

  // TTI
  useReportTti({
    isLive: mode === BotMode.SingleMode,
    extra: {
      mode: 'single-agent',
    },
  });
  const harmonizedHeight = getHarmonizedOnboardingHeight({
    onboardingHeight: onboardingSize?.height,
    status: harmonizeRenders,
  });
  const marginTop = useOnboardingCenterOffset({
    onboardingHeight: harmonizedHeight,
  });

  const isOnboardingEmpty = !debouncedPrologue && !suggestions.length;

  useUpdateEffect(() => {
    if (isOnboardingEmpty) {
      setHarmonizeRenders('ready-empty-onboarding');
      return;
    }
    setHarmonizeRenders('ready-onboarding');
  }, [isOnboardingEmpty]);

  useEffect(() => {
    if (harmonizeRenders === 'not-needed') {
      return;
    }
    if (harmonizeRenders === 'ready-onboarding') {
      setHarmonizeRenders('harmonized-onboarding');
      return;
    }
    if (harmonizeRenders === 'ready-empty-onboarding') {
      setHarmonizeRenders('harmonized-empty-onboarding');
      return;
    }
    setHarmonizeRenders('not-needed');
  }, [onboardingSize?.height]);

  if (hasMessages && !prologue) {
    return null;
  }

  if (hasMessages && prologue) {
    return (
      <div className={classNames(s.message)}>
        <MessageBox
          messageId={null}
          senderInfo={{ url: avatar, nickname: name, id }}
          showUserInfo={true}
          theme="grey"
          getBotInfo={() => undefined}
          showBackground={showBackground}
          enableImageAutoSize={enableImageAutoSize}
          imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
          eventCallbacks={eventCallbacks}
        >
          <div
            className={s['onboarding-message-content']}
            data-grab-mark={NO_MESSAGE_ID_MARK}
          >
            <LazyCozeMdBox
              insertedElements={renderVariable(prologue)}
              markDown={prologue}
              autoFixSyntax={{ autoFixEnding: false }}
              slots={{
                Image: CozeImageWithPreview,
                Link: CozeLink,
              }}
            ></LazyCozeMdBox>
          </div>
        </MessageBox>
      </div>
    );
  }

  return (
    <UIKitOnBoarding
      ref={ref}
      style={{ marginTop }}
      className={s['ui-kit-onboarding']}
      name={name}
      avatar={avatar}
      prologue={debouncedPrologue}
      suggestionListWithString={suggestions.map(sug => sug.content)}
      onSuggestionClick={sendTextMessage}
      showBackground={showBackground}
      suggestionsWithStringWrap={onBoardingSuggestionWrap}
      mdBoxProps={{
        insertedElements: renderVariable(prologue),
        slots: {
          Image: CozeImageWithPreview,
          Link: CozeLink,
        },
      }}
      enableAutoSizeImage={enableImageAutoSize}
      imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
      eventCallbacks={eventCallbacks}
      suggestionItemColor="white"
    />
  );
};
