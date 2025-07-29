import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';

import { OutputsField } from '../common/fields';
import { INPUT_PATH } from './constants';
import { InputsField } from './components/inputs';

export const FormRender = () => (
  <NodeConfigForm>
    <InputsField
      name={INPUT_PATH}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultValue={[{ name: 'input' } as any]}
      title={I18n.t('node_http_request_params')}
      tooltip={I18n.t('workflow_250429_03')}
      required={false}
      layout="horizontal"
    />

    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('node_http_response_data')}
      id="jsonStringify-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
