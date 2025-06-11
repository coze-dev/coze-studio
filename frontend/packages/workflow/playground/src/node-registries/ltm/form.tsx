import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';

import { OutputsField } from '../common/fields';
import { INPUT_PATH } from './constants';
import { Inputs } from './components';

export const FormRender = () => (
  <NodeConfigForm>
    <div className="relative">
      <Inputs
        name={INPUT_PATH}
        inputType={ViewVariableType.String}
        disabledTypes={ViewVariableType.getComplement([
          ViewVariableType.String,
        ])}
        defaultValue={[{ name: 'Query' }]}
      />
    </div>

    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('ltm_240826_02')}
      id="ltm-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
