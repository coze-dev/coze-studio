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
