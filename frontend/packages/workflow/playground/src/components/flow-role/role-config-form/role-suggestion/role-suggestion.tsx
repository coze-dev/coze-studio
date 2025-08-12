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

import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  Checkbox,
  TextArea,
  Typography,
  type CheckboxProps,
} from '@coze-arch/coze-design';
import { SuggestReplyInfoMode } from '@coze-arch/bot-api/workflow_api';

import css from './role-suggestion.module.less';

interface SuggestionValue {
  suggest_reply_mode?: SuggestReplyInfoMode;
  customized_suggest_prompt?: string;
}

interface RoleSuggestionProps {
  value?: SuggestionValue;
  disabled?: boolean;
  onChange: (v: SuggestionValue) => void;
}

export const RoleSuggestion: React.FC<RoleSuggestionProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const mode = value?.suggest_reply_mode ?? SuggestReplyInfoMode.Disable;
  const prompt = value?.customized_suggest_prompt;

  const label = useMemo(() => {
    if (mode === SuggestReplyInfoMode.Custom) {
      return I18n.t('bot_edit_auto_suggestion_customize_description');
    }
    if (mode === SuggestReplyInfoMode.System) {
      return I18n.t('bot_edit_auto_suggestion_default_description');
    }
    return I18n.t('bot_edit_auto_suggestion_off_description');
  }, [mode]);

  const isOpen = mode !== SuggestReplyInfoMode.Disable;
  const isCustom = mode === SuggestReplyInfoMode.Custom;

  const handleModeChange: CheckboxProps['onChange'] = v => {
    const next = v.target.checked
      ? SuggestReplyInfoMode.Custom
      : SuggestReplyInfoMode.System;
    onChange({
      suggest_reply_mode: next,
    });
  };
  const handlePromptChange = (v: string) => {
    onChange({
      suggest_reply_mode: SuggestReplyInfoMode.Custom,
      customized_suggest_prompt: v,
    });
  };

  return (
    <div>
      <Typography.Text size="small" type="secondary">
        {label}
      </Typography.Text>

      {isOpen ? (
        <div className={css['custom-block']}>
          <Checkbox
            checked={isCustom}
            disabled={disabled}
            onChange={handleModeChange}
          >
            <Typography.Text size="small" style={{ lineHeight: '20px' }} strong>
              {I18n.t('bot_edit_auto_suggestion_customize_user_checkbox')}
            </Typography.Text>
          </Checkbox>
          {isCustom ? (
            <TextArea
              disabled={disabled}
              placeholder={I18n.t(
                'bot_edit_auto_suggestion_customize_modal_prompt_placeholder',
              )}
              value={prompt}
              onChange={handlePromptChange}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
