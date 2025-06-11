import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import { useQuestionForm } from './use-question-form';

interface VirtualSyncProps {
  questionEvent?: NodeEvent;
}

export const VirtualSync: React.FC<VirtualSyncProps> = ({ questionEvent }) => {
  useQuestionForm(questionEvent);

  return null;
};
