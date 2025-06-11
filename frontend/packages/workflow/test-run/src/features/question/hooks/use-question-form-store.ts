import { useContext } from 'react';

import {
  questionFormContext,
  type QuestionFormState,
  type QuestionFormAction,
} from '../context';

export const useQuestionFormStore = <T>(
  selector: (s: QuestionFormState & QuestionFormAction) => T,
) => {
  const store = useContext(questionFormContext);

  return store(selector);
};
