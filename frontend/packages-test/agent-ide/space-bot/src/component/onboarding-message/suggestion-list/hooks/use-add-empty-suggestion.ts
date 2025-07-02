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
      // 如果列表全部有值，且不是只读状态，添加一条空项
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
