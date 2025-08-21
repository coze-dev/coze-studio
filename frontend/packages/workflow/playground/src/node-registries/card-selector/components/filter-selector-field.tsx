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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/bot-semi';

import { Section, useField, withField } from '@/form';

interface FilterOption {
  value: string;
  label: string;
}

// 默认筛选选项
const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部卡片' },
  { value: 'text', label: '文本卡片' },
  { value: 'image', label: '图片卡片' },
  { value: 'video', label: '视频卡片' },
  { value: 'link', label: '链接卡片' },
];

function FilterSelectorComp({
  title,
  tooltip,
  options = DEFAULT_FILTER_OPTIONS,
}: {
  title?: string;
  tooltip?: string;
  options?: FilterOption[];
}) {
  const { value, onChange, readonly, name } = useField<string>();

  return (
    <Section title={title} tooltip={tooltip}>
      <Select
        name={name}
        value={value}
        onChange={selectedValue => onChange(selectedValue as string)}
        disabled={readonly}
        placeholder={I18n.t('请选择筛选类型')}
        style={{ width: '100%' }}
      >
        {options.map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Section>
  );
}

export const FilterSelectorField = withField(FilterSelectorComp);
