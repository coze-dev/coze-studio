import React, { useRef } from 'react';

import { createQuestionFormStore } from './create-store';
import { questionFormContext } from './context';

interface QuestionFormProviderProps {
  spaceId: string;
  workflowId: string;
  executeId: string;
}

export const QuestionFormProvider: React.FC<
  React.PropsWithChildren<QuestionFormProviderProps>
> = ({ children, ...props }) => {
  const ref = useRef(createQuestionFormStore(props));

  return (
    <questionFormContext.Provider value={ref.current}>
      {children}
    </questionFormContext.Provider>
  );
};
