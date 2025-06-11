import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze/coze-design';

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
