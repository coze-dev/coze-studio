import { createContext } from 'react';

import { type createQuestionFormStore } from './create-store';

type QuestionFormStore = ReturnType<typeof createQuestionFormStore>;

export const questionFormContext = createContext<QuestionFormStore>(
  {} as unknown as QuestionFormStore,
);
