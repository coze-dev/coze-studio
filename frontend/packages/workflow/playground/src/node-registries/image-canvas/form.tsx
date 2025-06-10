import { nanoid } from 'nanoid';
import { type InputValueVO, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { Section } from '@/form';

import { InputsParametersField, OutputsField } from '../common/fields';
import { INPUT_PATH } from './constants';
import { Canvas } from './components';

export const FormRender = () => (
  <NodeConfigForm>
    <InputsParametersField
      name={INPUT_PATH}
      title={I18n.t('imageflow_canvas_element_set')}
      tooltip={I18n.t('imageflow_canvas_elment_tooltip')}
      paramsTitle={I18n.t('imageflow_canvas_element_name')}
      expressionTitle={I18n.t('imageflow_canvas_element_desc')}
      defaultValue={[]}
      onAppend={() =>
        ({
          id: nanoid(),
        }) as unknown as InputValueVO
      }
      disabledTypes={ViewVariableType.getComplement([
        ViewVariableType.String,
        ViewVariableType.Image,
      ])}
      // inputPlaceholder={inputPlaceholder}
      literalDisabled={true}
    />

    <Section
      title={I18n.t('imageflow_canvas_edit')}
      tooltip={I18n.t('imageflow_canvas_desc')}
    >
      <Canvas name="inputs.canvasSchema" />
    </Section>
    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('node_http_response_data')}
      id="imageCanvas-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
