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

import { useEffect } from 'react';

import { nanoid } from 'nanoid';

import { type SuggestionListContext } from '../index';
const maxItemLength = 100;

export const useAddEmptySuggestion = (context: SuggestionListContext) => {
  const {
    isReadonly,
    onChange,
    initValues: { suggested_questions },
  } = context.props;
  useEffect(() => {
    const addItemIfLastIsNotEmpty = () => {
      // If the list has all values and is not read-only, add an empty item
      const canAddItem =
        suggested_questions.length < maxItemLength &&
        suggested_questions.every(sug => sug.content);

      if (canAddItem && !isReadonly) {
        onChange?.(prev => ({
          ...prev,
          suggested_questions: [
            ...prev.suggested_questions,
            { id: nanoid(), content: '' },
          ],
        }));
      }
    };

    addItemIfLastIsNotEmpty();
  }, [suggested_questions]);
};
