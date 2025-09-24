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

import { I18n } from '@coze-arch/i18n';
import { Select, Tag } from '@coze-arch/bot-semi';

import { Section, useField, withField } from '@/form';

import { PLATFORM_OPTIONS } from '../constants';

type SelectValue = string | number | Record<string, unknown> | undefined;

function PlatformSelectorComponent({
  title = I18n.t('选择Agent平台'),
  tooltip = I18n.t('选择需要调用的智能体平台'),
}: {
  title?: string;
  tooltip?: string;
}) {
  const { value, onChange, readonly, name } = useField<string>();

  const handleChange = (selected: SelectValue) => {
    if (typeof selected === 'string') {
      onChange(selected);
    }
  };

  return (
    <Section title={title} tooltip={tooltip}>
      <Select
        name={name}
        value={value}
        disabled={readonly}
        placeholder={I18n.t('请选择平台')}
        style={{ width: '100%' }}
        onChange={handleChange}
      >
        {PLATFORM_OPTIONS.map(option => (
          <Select.Option
            key={option.value}
            value={option.value}
            disabled={!option.available}
          >
            <div className="flex flex-col gap-[4px]">
              <div className="flex items-center justify-between gap-[8px]">
                <span>{option.label}</span>
                <Tag size="small" color={option.available ? 'green' : 'grey'}>
                  {option.available ? '已支持' : '敬请期待'}
                </Tag>
              </div>
              {!option.available && option.reason ? (
                <span className="text-xs text-[#A4ACB3]">{option.reason}</span>
              ) : null}
            </div>
          </Select.Option>
        ))}
      </Select>
    </Section>
  );
}

export const PlatformSelectorField = withField(PlatformSelectorComponent);
