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
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Select, IconButton, type SelectProps } from '@coze-arch/coze-design';

import { type LanguageOption } from './voice-data-select/use-language-options';
import { VoiceDataSelect } from './voice-data-select';
import { type VoiceValue } from './utils';

interface VoiceLanguageSelectProps {
  value?: string;
  onChange: (v: string) => void;
  languageOptions: LanguageOption[];
  disabledLanguages?: string[];
}

export const VoiceLanguageSelect: React.FC<VoiceLanguageSelectProps> = ({
  value,
  onChange,
  languageOptions,
  disabledLanguages = [],
}) => {
  const optionList = useMemo(
    () =>
      languageOptions.map(item => ({
        label: item.languageName,
        value: item.languageCode,
        disabled: disabledLanguages.includes(item.languageCode),
      })),
    [languageOptions, disabledLanguages],
  );
  return (
    <Select
      placeholder={I18n.t('bot_edit_voices_modal_language')}
      optionList={optionList}
      value={value}
      onChange={onChange as SelectProps['onChange']}
      className="w-[140px] shrink-0"
    />
  );
};

interface VoiceSelectProps {
  value: VoiceValue;
  languageOptions: LanguageOption[];
  disabledLanguages?: string[];
  onChange: (v: VoiceValue) => void;
  onDelete: () => void;
}

export const VoiceSelect: React.FC<VoiceSelectProps> = ({
  value,
  languageOptions,
  disabledLanguages,
  onChange,
  onDelete,
}) => (
  <div className="flex items-center gap-[8px] px-[8px] py-[12px]">
    <VoiceLanguageSelect
      value={value.language}
      languageOptions={languageOptions}
      disabledLanguages={disabledLanguages}
      onChange={v => onChange({ language: v })}
    />
    <VoiceDataSelect
      language={value.language}
      value={value.data}
      onChange={v =>
        onChange({
          language: value.language,
          data: v,
        })
      }
    />
    <IconButton
      color="secondary"
      size="small"
      icon={<IconCozTrashCan />}
      onClick={onDelete}
    />
  </div>
);
