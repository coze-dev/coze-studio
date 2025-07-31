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

import { useState } from 'react';

import { useForm, observer } from '@coze-workflow/test-run/formily';
import { workflowApi } from '@coze-workflow/base';
import { CopilotType } from '@coze-arch/bot-api/workflow_api';
import { AIButton } from '@coze-arch/coze-design';

import { useGlobalState } from '@/hooks';

const PROLOGUE_KEY = IS_OVERSEA ? 'Prologues:' : '开场白:';
const QUESTION_KEY = IS_OVERSEA ? 'SuggestedQuestions:' : '建议问题:';

const formatContent = (str: string) => {
  const parts = str.split('\n\n');
  let prologue = '';
  let questions: string[] = [];
  for (const part of parts) {
    if (part.startsWith(PROLOGUE_KEY)) {
      prologue = part.replace(`${PROLOGUE_KEY}\n`, '').trim(); // Extract the opening line and remove the label
    } else if (part.startsWith(QUESTION_KEY)) {
      const questionLines = part.replace(`${QUESTION_KEY}\n`, '').trim(); // Remove the label
      questions = questionLines.split('\n').map(q => q.trim()); // Remove the number
    }
  }

  return {
    prologue,
    questions,
  };
};

export const AIGenerateBtn: React.FC = observer(() => {
  const form = useForm();
  const [generating, setGenerating] = useState(false);

  const { spaceId, workflowId } = useGlobalState();

  const generate = async () => {
    const query = form.getValuesIn('name');

    try {
      setGenerating(true);
      const { data } = await workflowApi.CopilotGenerate({
        space_id: spaceId,
        project_id: '',
        copilot_type: CopilotType.OnboardingMessage,
        query,
        workflow_id: workflowId,
      });
      const { prologue, questions } = formatContent(data?.content || '');

      if (prologue) {
        form.setValuesIn('prologue', prologue);
      }
      if (Array.isArray(questions) && questions.length) {
        form.setValuesIn('questions', questions);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AIButton
      size="small"
      color="aihglt"
      onlyIcon
      loading={generating}
      disabled={form.disabled}
      onClick={generate}
    />
  );
});
