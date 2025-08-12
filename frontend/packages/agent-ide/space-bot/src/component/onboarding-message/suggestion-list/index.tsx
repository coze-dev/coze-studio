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

import React, {
  type Dispatch,
  type FC,
  type SetStateAction,
  useMemo,
} from 'react';

import { SortableList } from '@coze-studio/components/sortable-list';
import { type TItemRender } from '@coze-studio/components';
import { type SuggestQuestionMessage } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { type SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';

import s from '../index.module.less';
import { SuggestQuestionItemContent } from './suggestion-item';
import { SuggestionHeader } from './suggestion-header';
import { useAddEmptySuggestion } from './hooks/use-add-empty-suggestion';
const SortableListSymbol = Symbol('onboarding-suggestion-list');

export interface SuggestionListContext {
  props: SuggestionListProps;
}

interface SuggestionListInitValues {
  suggested_questions: SuggestQuestionMessage[];
  suggested_questions_show_mode: SuggestedQuestionsShowMode;
}

export interface SuggestionListProps {
  initValues?: SuggestionListInitValues;
  isReadonly?: boolean;
  onBlur?: () => void;
  onChange?: Dispatch<SetStateAction<SuggestionListInitValues>>;
}
export const SuggestionList: FC<SuggestionListProps> = props => {
  const {
    initValues: { suggested_questions },
    isReadonly,
    onBlur,
    onChange,
  } = props;
  const context: SuggestionListContext = {
    props,
  };
  useAddEmptySuggestion(context);

  const itemRender = useMemo<TItemRender<SuggestQuestionMessage>>(
    () =>
      ({ data, connect, isDragging, isHovered }) =>
        (
          <SuggestQuestionItemContent
            key={data.id}
            message={data}
            isDragging={Boolean(isDragging)}
            isHovered={Boolean(isHovered)}
            connect={connect}
            value={suggested_questions}
            handleOnBlur={onBlur}
            disabled={!data.content}
            onMessageChange={value => {
              onChange?.(prev => {
                const _suggestions = [...prev.suggested_questions];
                const index = _suggestions.findIndex(
                  item => item.id === data.id,
                );
                _suggestions.splice(index, 1, value);
                return {
                  ...prev,
                  suggested_questions: _suggestions,
                };
              });
            }}
            handleRemoveSuggestion={id => {
              onChange?.(prev => ({
                ...prev,
                suggested_questions: prev.suggested_questions.filter(
                  sug => sug.id !== id,
                ),
              }));
            }}
          />
        ),
    [isReadonly],
  );

  return (
    <>
      <SuggestionHeader
        context={context}
        onSwitchShowMode={mode => {
          onChange?.(prev => ({
            ...prev,
            suggested_questions_show_mode: mode,
          }));
        }}
      />
      <SortableList
        type={SortableListSymbol}
        list={suggested_questions}
        getId={suggestion => suggestion.id}
        enabled={suggested_questions.length > 1}
        onChange={(newList: SuggestQuestionMessage[]) => {
          onChange?.(prev => ({
            ...prev,
            suggested_questions: newList,
          }));
        }}
        itemRender={itemRender}
      />
      {isReadonly && !suggested_questions.length ? (
        <div className={s['text-none']}>{I18n.t('bot_element_unset')}</div>
      ) : null}
    </>
  );
};
