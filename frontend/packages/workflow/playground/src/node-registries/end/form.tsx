import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useWatch } from '@/form';

import { InputsParametersField, AnswerContentField } from '../common/fields';
import { TerminatePlan } from './types';
import {
  INPUT_PATH,
  TERMINATE_PLAN_PATH,
  ANSWER_CONTENT_PATH,
  STREAMING_OUTPUT_PATH,
} from './constants';
import { TerminatePlanField } from './components/terminate-plan-field';

export const FormRender = withNodeConfigForm(() => {
  const terminatePlan = useWatch<TerminatePlan>(TERMINATE_PLAN_PATH);
  const inputParameters = useWatch<InputValueVO[]>(INPUT_PATH);
  return (
    <>
      <TerminatePlanField />
      <InputsParametersField
        name={INPUT_PATH}
        title={I18n.t('workflow_detail_end_output')}
        tooltip={I18n.t('workflow_detail_end_output_tooltip')}
        isTree={true}
      />
      {terminatePlan === TerminatePlan.UseAnswerContent ? (
        <AnswerContentField
          editorFieldName={ANSWER_CONTENT_PATH}
          switchFieldName={STREAMING_OUTPUT_PATH}
          title={I18n.t('workflow_detail_end_answer')}
          tooltip={I18n.t('workflow_detail_end_answer_tooltip')}
          enableStreamingOutput
          switchLabel={I18n.t('workflow_message_streaming_name')}
          switchTooltip={I18n.t('workflow_message_streaming_tooltips')}
          // 适配旧的 testId 格式
          testId={`/${ANSWER_CONTENT_PATH.split('.').join('/')}`}
          switchTestId={STREAMING_OUTPUT_PATH.split('.')?.at(-1)}
          inputParameters={inputParameters}
        />
      ) : null}
    </>
  );
});
