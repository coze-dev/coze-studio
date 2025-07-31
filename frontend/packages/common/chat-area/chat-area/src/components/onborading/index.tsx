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

import { useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useSize } from 'ahooks';
import { OnBoarding as UIKitOnBoarding } from '@coze-common/chat-uikit';
import { SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';

import { Wrapper } from '../wrapper';
import { type ComponentTypesMap } from '../types';
import { OnboardingMessage } from '../onborading-message';
import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { useUIKitMessageImageAutoSizeConfig } from '../../hooks/uikit/use-ui-kit-message-image-auto-size-config';
import { useEventCallbacks } from '../../hooks/uikit/use-event-callbacks';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useOnboardingCenterOffset } from '../../hooks/public/use-onboarding-center-offset';
import { useSendTextMessage } from '../../hooks/messages/use-send-message';
import { useChatAreaCustomComponent } from '../../hooks/context/use-chat-area-custom-component';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';

import styles from './index.module.less';

const BuiltinOnboarding: ComponentTypesMap['onboarding'] = ({
  prologue,
  suggestions,
  sendTextMessage,
  hasMessages,
  avatar,
  name,
  onOnboardingIdChange,
  enableImageAutoSize,
  imageAutoSizeContainerWidth,
  eventCallbacks,
}) => {
  const {
    readonly,
    showOnboardingMessage,
    forceShowOnboardingMessage,
    isOnboardingCentered,
    layout,
    onboardingSuggestionsShowMode,
  } = usePreference();
  const showBackground = useShowBackGround();

  const ref = useRef<HTMLDivElement>(null);
  const targetRef = isOnboardingCentered ? ref : null;
  const onboardingSize = useSize(targetRef);
  const CustomeUIKitOnBoarding =
    usePluginCustomComponents('UIKitOnBoardingPlugin').at(0)?.Component ||
    UIKitOnBoarding;

  const centerOffset = useOnboardingCenterOffset({
    // by UI
    onboardingHeight: onboardingSize?.height,
  });

  if (hasMessages && !prologue) {
    return null;
  }

  if (hasMessages && prologue && !showOnboardingMessage) {
    return null;
  }

  if (
    (hasMessages && prologue && showOnboardingMessage) ||
    forceShowOnboardingMessage
  ) {
    return <OnboardingMessage onOnboardingIdChange={onOnboardingIdChange} />;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className={classNames(styles.onboarding)}>
        <CustomeUIKitOnBoarding
          ref={ref}
          style={{ marginTop: centerOffset }}
          className={styles['ui-kit-onboarding']}
          name={name}
          avatar={avatar}
          prologue={prologue}
          suggestionListWithString={suggestions.map(sug => sug.content)}
          suggestionsWithStringWrap={
            onboardingSuggestionsShowMode === SuggestedQuestionsShowMode.All
          }
          onSuggestionClick={sendTextMessage}
          readonly={readonly}
          showBackground={showBackground}
          layout={layout}
          enableAutoSizeImage={enableImageAutoSize}
          imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
          eventCallbacks={eventCallbacks}
        />
      </div>
    </div>
  );
};

export const OnboardingContent = () => {
  const [onboardingId, setOnboardingId] = useState<string | null>(null);

  const onOnboardingIdChange = (id: string) => {
    setOnboardingId(id);
  };

  const { useOnboardingStore, useMessagesStore, useSelectionStore } =
    useChatAreaStoreSet();
  const componentTypes = useChatAreaCustomComponent();
  const { onboarding: CustomOnboarding } = componentTypes;
  const { messageWidth, readonly, onboardingSuggestionsShowMode } =
    usePreference();
  const selectedOnboardingId = useSelectionStore(
    state => state.selectedOnboardingId,
  );
  const { prologue, suggestions, name, avatar } = useOnboardingStore(
    useShallow(state => ({
      prologue: state.prologue,
      suggestions: state.suggestions,
      name: state.name,
      avatar: state.avatar,
    })),
  );
  const hasMessages = useMessagesStore(state => Boolean(state.messages.length));
  const sendTextMessage = useSendTextMessage();

  const OnboardingComponent = CustomOnboarding || BuiltinOnboarding;

  const showBackground = useShowBackGround();

  const { imageAutoSizeContainerWidth, enableImageAutoSize } =
    useUIKitMessageImageAutoSizeConfig();

  const eventCallbacks = useEventCallbacks();

  return (
    <Wrapper
      className={classNames({
        [styles['message-checked'] as string]:
          selectedOnboardingId === onboardingId && selectedOnboardingId,
        '!bg-transparent': showBackground,
      })}
    >
      <div
        style={{ maxWidth: messageWidth }}
        className={styles.onboarding}
        data-testid="bot.ide.chat_area.onboarding_content"
      >
        <OnboardingComponent
          hasMessages={hasMessages}
          prologue={prologue}
          suggestions={suggestions}
          onboardingSuggestionsShowMode={onboardingSuggestionsShowMode}
          sendTextMessage={content => {
            sendTextMessage({ text: content, mentionList: [] }, 'suggestion');
          }}
          name={name}
          avatar={avatar}
          onOnboardingIdChange={onOnboardingIdChange}
          readonly={readonly}
          enableImageAutoSize={enableImageAutoSize}
          imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
          eventCallbacks={eventCallbacks}
        />
      </div>
    </Wrapper>
  );
};

OnboardingContent.displayName = 'ChatAreaOnboardingContent';
