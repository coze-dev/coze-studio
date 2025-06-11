import { useState } from 'react';

import { useForm, observer } from '@coze-workflow/test-run/formily';
import { workflowApi } from '@coze-workflow/base';
import { CopilotType } from '@coze-arch/bot-api/workflow_api';
import { AIButton } from '@coze/coze-design';

import { useGlobalState } from '@/hooks';

const PROLOGUE_KEY = IS_OVERSEA ? 'Prologues:' : '开场白:';
const QUESTION_KEY = IS_OVERSEA ? 'SuggestedQuestions:' : '建议问题:';

const formatContent = (str: string) => {
  const parts = str.split('\n\n');
  let prologue = '';
  let questions: string[] = [];
  for (const part of parts) {
    if (part.startsWith(PROLOGUE_KEY)) {
      prologue = part.replace(`${PROLOGUE_KEY}\n`, '').trim(); // 提取开场白并去掉标签
    } else if (part.startsWith(QUESTION_KEY)) {
      const questionLines = part.replace(`${QUESTION_KEY}\n`, '').trim(); // 去掉标签
      questions = questionLines.split('\n').map(q => q.trim()); // 去掉编号
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
