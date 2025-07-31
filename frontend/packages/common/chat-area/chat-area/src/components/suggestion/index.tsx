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

import classNames from 'classnames';
import { SuggestionItem } from '@coze-common/chat-uikit';
import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';
import { I18n } from '@coze-arch/i18n';
import { IconAlertStroked } from '@coze-arch/bot-icons';
import { SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';
import { Layout } from '@coze-common/chat-uikit-shared';

import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useMessagesOverview } from '../../hooks/public/use-messages-overview';
import { useSendTextMessage } from '../../hooks/messages/use-send-message';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { type PreferenceContextInterface } from '../../context/preference/types';
import { usePreference } from '../../context/preference';

import s from './index.module.less';

export const SuggestionInChat = () => {
  const { useMessagesStore, useSuggestionsStore } = useChatAreaStoreSet();
  const { enableMention } = usePreference();
  // Before fixme, it is unreliable to directly take the last message for processing, and there are still problems after modification. Consider the suggestion stored in the sender_id
  const latestGroup = useMessagesStore(state => state.messageGroupList.at(0));
  const senderId = useMessagesStore(
    state =>
      state.messages.find(msg =>
        latestGroup?.memberSet.llmAnswerMessageIdList.includes(msg.message_id),
      )?.sender_id,
  );
  // Note that for notice or manual trigger type messages, groupId is obtained by message_id stitching.
  // So it must not be possible to reverse index based on replyId
  const replyId = latestGroup?.groupId;
  const { latestSectionHasMessage } = useMessagesOverview();
  const suggestionBatch = useSuggestionsStore(state =>
    latestSectionHasMessage ? state.getSuggestions(replyId) : undefined,
  );

  const { selectable, messageWidth, layout } = usePreference();

  const showBackground = useShowBackGround();

  if (!latestSectionHasMessage) {
    return null;
  }

  if (suggestionBatch?.isError) {
    return (
      <div
        className={classNames(s['suggestion-fail-wrap'], {
          [s['suggestion-fail-wrap-selectable'] as string]: selectable,
          // Adapt mobile end to solve suggestion error margin problem
          [s['suggestion-fail-wrap-mobile'] as string]:
            layout === Layout.MOBILE,
          [s['suggestion-fail-wrap-pc'] as string]: layout === Layout.PC,
        })}
        style={{ width: messageWidth }}
      >
        <div
          className={classNames(
            s['suggestion-fail-tip'],
            [
              'coz-fg-hglt-red',
              'coz-stroke-plus',
              'rounded-normal',
              'py-8px',
              'px-16px',
            ],
            showBackground && '!coz-bg-image-question !coz-stroke-image-bots',
          )}
        >
          <IconAlertStroked />
          <span>
            {I18n.t('bot_edit_auto_suggestion_customize_failed_to_generate')}
          </span>
        </div>
      </div>
    );
  }

  if (!suggestionBatch?.suggestions.length) {
    return null;
  }
  return (
    <Suggestions
      suggestions={suggestionBatch.suggestions}
      senderId={enableMention ? senderId : undefined}
    />
  );
};

const getSuggestionColorByTheme: (
  theme: PreferenceContextInterface['theme'],
) => 'white' | 'grey' = theme => {
  if (theme === 'home') {
    return 'grey';
  }
  if (theme === 'debug' || theme === 'store') {
    return 'white';
  }
  exhaustiveCheckSimple(theme);
  return 'white';
};

export const Suggestions = ({
  suggestions,
  isInNewConversation,
  senderId,
  suggestionsShowMode,
}: {
  suggestions: string[];
  isInNewConversation?: boolean;
  /**
   * SuggestionInChat does not pass a value when enableMention false
   */
  senderId: string | undefined;
  suggestionsShowMode?: SuggestedQuestionsShowMode;
}) => {
  const sendTextMessage = useSendTextMessage();

  const onSubmit = (param: { text: string; mentionList: { id: string }[] }) => {
    sendTextMessage(param, 'suggestion');
  };

  const { selectable, messageWidth, readonly, layout, theme } = usePreference();
  const showBackground = useShowBackGround();

  if (selectable) {
    return null;
  }

  return (
    <div
      data-testid="chat-area.suggestion-list"
      className={classNames(s.suggestions, {
        // Adapt mobile end to solve the suggestion margin problem
        [s['suggestion-with-selectable-in-new-conversation'] as string]:
          selectable && isInNewConversation,
        [s['suggestions-mobile'] as string]: layout === Layout.MOBILE,
        [s['suggestions-pc'] as string]: layout === Layout.PC,
        'flex flex-wrap gap-2':
          suggestionsShowMode === SuggestedQuestionsShowMode.All,
      })}
      style={{ width: messageWidth }}
    >
      {suggestions.map(sug => (
        <SuggestionItem
          key={sug}
          className={classNames({
            '!mb-0': suggestionsShowMode === SuggestedQuestionsShowMode.All,
          })}
          readonly={readonly}
          message={{ content_obj: sug, sender_id: senderId }}
          onSuggestionClick={onSubmit}
          showBackground={showBackground}
          color={getSuggestionColorByTheme(theme)}
        />
      ))}
    </div>
  );
};

SuggestionInChat.displayName = 'ChatAreaSuggestionInChat';
Suggestions.displayName = 'ChatAreaSuggestions';
