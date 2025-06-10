import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { AnswerItem } from './question-pairs-answer';
import { Field } from './field';
export function MessageOutput() {
  const { data } = useWorkflowNode();
  const outputContent = data?.inputs?.content;
  return (
    <Field label={I18n.t('workflow_241111_01')}>
      <AnswerItem
        showLabel={false}
        label=""
        content={outputContent}
        maxWidth={260}
      />
    </Field>
  );
}
