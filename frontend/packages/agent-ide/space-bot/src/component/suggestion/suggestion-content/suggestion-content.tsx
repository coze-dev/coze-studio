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

import { useRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type CheckboxProps } from '@coze-arch/bot-semi/Checkbox';
import { Checkbox } from '@coze-arch/bot-semi';
import { SuggestReplyMode } from '@coze-arch/bot-api/developer_api';
import { type BotSuggestionConfig } from '@coze-studio/bot-detail-store/src/types/skill';
import { DEFAULT_SUGGESTION_PROMPT } from '@coze-studio/bot-detail-store/bot-skill';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';

import { CollapsibleTextarea } from '../../collapsible-textarea';

import s from './suggestion-content.module.less';

export type SuggestionContentProps = {
  disabled?: boolean;
  onChange: (config: Partial<BotSuggestionConfig>) => void;
  /** Is the mode from the child bot? */
  followBot?: boolean;
} & (
  | {
      mode: SuggestReplyMode.WithCustomizedPrompt;
      prompt: string;
      /** Is it in multi-agent mode? */
      multiAgent?: boolean;
    }
  | {
      mode: SuggestReplyMode.WithDefaultPrompt | SuggestReplyMode.Disable;
    }
);

/** Custom suggestion textarea maximum height */
const MAX_CUSTOM_SUGGESTION_PROMPT_HEIGHT = 340;

export function SuggestionContent({
  disabled,
  followBot,
  onChange,
  ...props
}: SuggestionContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={s['suggestion-content']}>
      {/* No suggestion */}
      {props.mode === SuggestReplyMode.Disable && (
        <div className={s.description}>
          {I18n.t('bot_edit_auto_suggestion_off_description')}
        </div>
      )}

      {/* Default suggestion */}
      {props.mode === SuggestReplyMode.WithDefaultPrompt && (
        <>
          <div className={s.description}>
            {I18n.t('bot_edit_auto_suggestion_default_description')}
          </div>
          {!disabled && (
            <CustomPromptCheckbox
              disabled={followBot}
              checked={false}
              onChange={event => {
                const { checked } = event.target;
                if (!checked) {
                  return;
                }
                onChange({
                  suggest_reply_mode: SuggestReplyMode.WithCustomizedPrompt,
                });
                setTimeout(() => textareaRef.current?.focus());
              }}
            />
          )}
        </>
      )}

      {/* Custom suggestion prompt */}
      {props.mode === SuggestReplyMode.WithCustomizedPrompt && (
        <>
          <div className={s.description}>
            {I18n.t('bot_edit_auto_suggestion_customize_description')}
          </div>
          {!disabled && (
            <CustomPromptCheckbox
              disabled={followBot}
              checked={true}
              onChange={event => {
                const { checked } = event.target;
                if (checked) {
                  return;
                }
                onChange({
                  suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
                });
              }}
            />
          )}
          {!followBot &&
            (disabled && !props.multiAgent ? (
              <div className={s['prompt-text']}>{props.prompt}</div>
            ) : (
              <>
                <CollapsibleTextarea
                  ref={textareaRef}
                  className={s['prompt-input']}
                  readonly={disabled}
                  value={props.prompt}
                  onChange={val => {
                    onChange({
                      customized_suggest_prompt: val,
                    });
                  }}
                  onBlur={() => {
                    const finalPrompt = props.prompt?.trim();
                    if (finalPrompt) {
                      return;
                    }
                    onChange({
                      suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
                      customized_suggest_prompt: DEFAULT_SUGGESTION_PROMPT(),
                    });
                  }}
                  ellipse={{ rows: 3 }}
                  autoSize={{
                    maxHeight: props.multiAgent
                      ? MAX_CUSTOM_SUGGESTION_PROMPT_HEIGHT
                      : undefined,
                    textAreaProps: { rows: 3 },
                  }}
                  maxCount={botInputLengthService.getInputLengthLimit(
                    'suggestionPrompt',
                  )}
                  maxLength={botInputLengthService.getInputLengthLimit(
                    'suggestionPrompt',
                  )}
                  placeholder={I18n.t(
                    'bot_edit_auto_suggestion_customize_modal_prompt_placeholder',
                  )}
                />
              </>
            ))}
        </>
      )}
    </div>
  );
}

function CustomPromptCheckbox({ ...props }: CheckboxProps) {
  return (
    <Checkbox {...props} className={s['custom-prompt-checkbox']}>
      {I18n.t('bot_edit_auto_suggestion_customize_user_checkbox')}
    </Checkbox>
  );
}
