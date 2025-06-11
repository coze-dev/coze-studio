/**
 * 意图识别节点，选项组件渲染
 */

import { INTENT_NODE_MODE } from '@coze-workflow/nodes';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { calcPortId } from '@/form-extensions/setters/answer-option/utils';

import { AnswerItem } from './question-pairs-answer';
import { Port } from './port';
import { Field } from './field';

export function Intents() {
  const { data } = useWorkflowNode();
  const intents =
    data?.intentMode === INTENT_NODE_MODE.MINIMAL
      ? data?.quickIntents
      : data?.intents;

  return (
    <>
      <div className="mt-[20px]" />
      <div className="mt-[20px]" />
      {intents?.map((intent: { name: string }, index: number) => (
        <Field
          key={intent?.name + index}
          label={I18n.t('workflow_ques_ans_type_option_title')}
        >
          <AnswerItem
            showLabel={false}
            label=""
            content={intent?.name}
            maxWidth={260}
          />
          <Port id={calcPortId(index)} type="output" />
        </Field>
      ))}

      <Field label={I18n.t('workflow_ques_ans_type_option_other')}>
        <Port id="default" type="output" />
      </Field>
    </>
  );
}
