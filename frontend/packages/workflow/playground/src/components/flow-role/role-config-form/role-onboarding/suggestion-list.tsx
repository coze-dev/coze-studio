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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozHandle,
  IconCozMinusCircle,
} from '@coze-arch/coze-design/icons';
import { TextArea, IconButton, Typography } from '@coze-arch/coze-design';

import { SortableList } from '@/components/sortable-list';

import css from './suggestion-list.module.less';

const MAX_LEN = 100;

interface SuggestionItemProps {
  value?: string;
  dragRef?: React.Ref<HTMLDivElement>;
  isLast: boolean;
  disabled?: boolean;
  onChange: (val: string) => void;
  onDelete: () => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  value,
  dragRef,
  isLast,
  disabled,
  onChange,
  onDelete,
}) => {
  const draggable = !(isLast && !value) && !disabled;
  const deletable = !(isLast && !value) && !disabled;

  return (
    <div className={css['suggestion-list']}>
      <div
        className={cls(css['drag-btn'], {
          [css.disabled]: !draggable,
        })}
        ref={draggable ? dragRef : null}
      >
        <IconCozHandle />
      </div>
      <TextArea
        value={value}
        className={css['text-area']}
        autosize
        rows={1}
        onChange={onChange}
        disabled={disabled}
        placeholder={I18n.t('opening_question_placeholder')}
      />
      <div className={css['delete-btn']}>
        <IconButton
          color="secondary"
          size="small"
          disabled={!deletable}
          icon={<IconCozMinusCircle />}
          onClick={onDelete}
        />
      </div>
    </div>
  );
};

interface SuggestionListProps {
  value?: string[];
  disabled?: boolean;
  onChange: (val?: string[]) => void;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const innerValue = useMemo(() => {
    if (disabled) {
      return value || [];
    }
    if (!value || (value.length < MAX_LEN && value.every(Boolean))) {
      return (value || []).concat('');
    }
    return value || [];
  }, [value, disabled]);

  const handleChange = (next: string[]) => {
    // Filter out all empty items
    const temp = next.filter(i => Boolean(i));
    onChange(temp);
  };

  const handleDelete = (idx: number) => {
    handleChange(innerValue.filter((_, index) => index !== idx));
  };

  const handleContentChange = (idx: number, val: string) => {
    const next = [...innerValue];
    next.splice(idx, 1, val);
    handleChange(next);
  };

  // The length is 0, it only appears in the read-only state, and the prompt text can be used.
  if (!innerValue.length) {
    return (
      <Typography.Text size="small">
        {I18n.t('bot_element_unset')}
      </Typography.Text>
    );
  }

  return (
    <SortableList
      value={innerValue}
      onChange={handleChange}
      renderItem={(field, idx, opt) => (
        <SuggestionItem
          dragRef={opt?.dragRef}
          value={innerValue[idx]}
          isLast={idx === innerValue.length - 1}
          disabled={disabled}
          onChange={val => handleContentChange(idx, val)}
          onDelete={() => handleDelete(idx)}
        />
      )}
    />
  );
};
