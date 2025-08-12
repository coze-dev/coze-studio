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

import { useEffect, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isNil } from 'lodash-es';
import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import {
  DEFAULT_SUGGESTION_PROMPT,
  useBotSkillStore,
} from '@coze-studio/bot-detail-store/bot-skill';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';
import { OpenBlockEvent, emitEvent } from '@coze-arch/bot-utils';
import { EVENT_NAMES } from '@coze-arch/bot-tea';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { SuggestReplyMode } from '@coze-arch/bot-api/developer_api';
import { sendTeaEventInBot } from '@coze-agent-ide/agent-ide-commons';

import { SuggestionContent } from './suggestion-content/suggestion-content';

type ISuggestionBlockProps = ToolEntryCommonProps;

export const SuggestionBlock: FC<ISuggestionBlockProps> = ({ title }) => {
  const setToolValidData = useToolValidData();

  const { suggestionConfig, setSuggestionConfig } = useBotSkillStore(
    useShallow($store => ({
      suggestionConfig: $store.suggestionConfig,
      setSuggestionConfig: $store.setSuggestionConfig,
    })),
  );
  const isReadonly = useBotDetailIsReadonly();

  const isOpen =
    suggestionConfig.suggest_reply_mode ===
    SuggestReplyMode.WithCustomizedPrompt;

  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.AUTO_SUGGESTION,
    configured: isOpen,
  });

  useEffect(() => {
    setToolValidData(
      suggestionConfig.suggest_reply_mode !== SuggestReplyMode.Disable,
    );
  }, [suggestionConfig.suggest_reply_mode]);

  return (
    <ToolContentBlock
      showBottomBorder
      header={title}
      blockEventName={OpenBlockEvent.SUGGESTION_BLOCK_OPEN}
      defaultExpand={defaultExpand}
      actionButton={
        <Select
          size="small"
          disabled={isReadonly}
          optionList={[
            {
              value: SuggestReplyMode.WithDefaultPrompt,
              label: I18n.t('bot_suggestion_switch_on_title'),
            },
            {
              value: SuggestReplyMode.Disable,
              label: I18n.t('bot_edit_auto_suggestion_status_off'),
            },
          ]}
          value={
            suggestionConfig.suggest_reply_mode ===
            SuggestReplyMode.WithCustomizedPrompt
              ? SuggestReplyMode.WithDefaultPrompt
              : suggestionConfig.suggest_reply_mode
          }
          onChange={mode => {
            setSuggestionConfig({
              suggest_reply_mode: mode as
                | SuggestReplyMode.Disable
                | SuggestReplyMode.WithDefaultPrompt,
            });
            emitEvent(OpenBlockEvent.SUGGESTION_BLOCK_OPEN);
            sendTeaEventInBot(EVENT_NAMES.edited_suggestion, {
              suggestion_type: String(mode),
            });
          }}
        />
      }
    >
      <SuggestionContent
        disabled={isReadonly}
        onChange={suggestion => {
          if (
            !isNil(suggestion.suggest_reply_mode) &&
            suggestion.suggest_reply_mode !==
              suggestionConfig.suggest_reply_mode
          ) {
            sendTeaEventInBot(EVENT_NAMES.edited_suggestion, {
              suggestion_type: String(suggestion.suggest_reply_mode),
            });

            console.log('suggestion:>>', suggestion);
            console.log('suggestionConfig:>>', suggestionConfig);
            if (
              !suggestion?.customized_suggest_prompt &&
              !suggestionConfig.customized_suggest_prompt
            ) {
              suggestion.customized_suggest_prompt =
                DEFAULT_SUGGESTION_PROMPT();
            }
          }

          setSuggestionConfig(suggestion);
        }}
        {...(suggestionConfig.suggest_reply_mode ===
        SuggestReplyMode.WithCustomizedPrompt
          ? {
              mode: suggestionConfig.suggest_reply_mode,
              prompt: suggestionConfig.customized_suggest_prompt,
            }
          : {
              mode: suggestionConfig.suggest_reply_mode as
                | SuggestReplyMode.WithDefaultPrompt
                | SuggestReplyMode.Disable,
            })}
      />
    </ToolContentBlock>
  );
};
