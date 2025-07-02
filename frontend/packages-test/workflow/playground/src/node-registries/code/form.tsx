import { I18n } from '@coze-arch/i18n';
import { useForm } from '@flowgram-adapter/free-layout-editor';

import { NodeConfigForm } from '@/node-registries/common/components';

import { OutputsField, InputsParametersField } from '../common/fields';
import { CODE_PATH, INPUT_PATH, OUTPUT_PATH } from './constants';
import { CodeField } from './components';

export const FormRender = () => {
  const form = useForm();
  return (
    <NodeConfigForm>
      <InputsParametersField
        name={INPUT_PATH}
        tooltip={I18n.t('workflow_detail_code_input_tooltip')}
        isTree={true}
      />

      <CodeField
        name={CODE_PATH}
        tooltip={I18n.t('workflow_detail_code_code_tooltip')}
        inputParams={form.getValueIn(INPUT_PATH)}
        outputParams={form.getValueIn(OUTPUT_PATH)}
        hasFeedback={false}
      />

      <OutputsField
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('workflow_detail_code_output_tooltip')}
        jsonImport={false}
        id="code-node-outputs"
        name={OUTPUT_PATH}
        hasFeedback={false}
      />
    </NodeConfigForm>
  );
};
