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

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { Strategy } from '../../type';

import s from './index.module.less';

const optionList = [
  {
    value: Strategy.Semantic,
    label: I18n.t('knowledge_semantic_search_title'),
  },
  {
    value: Strategy.Hybird,
    label: I18n.t('knowledge_hybird_search_title'),
  },
  {
    value: Strategy.FullText,
    label: I18n.t('knowledge_full_text_search_title'),
  },
];

interface SearchStrategyProps {
  value: Strategy;
  onChange: (v: Strategy) => void;
  style?: React.CSSProperties;
  readonly?: boolean;
}

export const SearchStrategy: React.FC<SearchStrategyProps> = props => {
  const { value, onChange, style, readonly } = props;

  const { getNodeSetterId } = useNodeTestId();

  return (
    <Select
      className={s['strategy-area']}
      dropdownClassName={s['strategy-area-dropdown']}
      size="small"
      value={value}
      style={{
        ...style,
        pointerEvents: readonly ? 'none' : 'auto',
      }}
      onChange={onChange as (v: unknown) => void}
      // defaultValue={Strategy.Semantic}
      data-testid={getNodeSetterId('dataset-search-strategy')}
    >
      {optionList.map(v => (
        <Select.Option
          value={v.value}
          key={v.value}
          data-testid={getNodeSetterId('dataset-search-strategy-option')}
        >
          {v.label}
        </Select.Option>
      ))}
    </Select>
  );
};
