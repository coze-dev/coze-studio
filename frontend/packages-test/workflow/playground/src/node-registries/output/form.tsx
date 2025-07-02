import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useWatch } from '@/form';

import { InputsParametersField, AnswerContentField } from '../common/fields';
import {
  INPUT_PATH,
  ANSWER_CONTENT_PATH,
  STREAMING_OUTPUT_PATH,
} from './constants';

export const FormRender = withNodeConfigForm(() => {
  const inputParameters = useWatch<InputValueVO[]>(INPUT_PATH);
  return (
    <>
      <InputsParametersField
        key={INPUT_PATH}
        name={INPUT_PATH}
        title={I18n.t('workflow_detail_end_output')}
        tooltip={I18n.t('workflow_message_variable_tooltips')}
        isTree={true}
      />
      <AnswerContentField
        key={ANSWER_CONTENT_PATH}
        editorFieldName={ANSWER_CONTENT_PATH}
        switchFieldName={STREAMING_OUTPUT_PATH}
        title={I18n.t('workflow_241111_01')}
        tooltip={I18n.t('workflow_message_anwser_tooltips')}
        enableStreamingOutput
        switchLabel={I18n.t('workflow_message_streaming_name')}
        switchTooltip={I18n.t('workflow_message_streaming_tooltips')}
        // 适配旧的 testId 格式
        testId={`/${ANSWER_CONTENT_PATH.split('.').join('/')}`}
        switchTestId={STREAMING_OUTPUT_PATH.split('.')?.at(-1)}
        inputParameters={inputParameters}
      />
    </>
  );
});
