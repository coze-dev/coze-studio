import { ValueExpressionType, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { Section, InputNumberField } from '@/form';

import { OutputsField, ParametersInputGroup } from '../common/fields';
import { ApiSetter, AuthSetter, BodySetter } from './setters';
import { INPUT_VALUE_COLUMNS } from './constants';

const Render = () => (
  <NodeConfigForm>
    <ApiSetter />
    <ParametersInputGroup
      name="inputs.params"
      title={I18n.t('node_http_request_params')}
      tooltip={I18n.t('node_http_request_params_desc')}
      hiddenTypes
      defaultValue={[]}
      columns={INPUT_VALUE_COLUMNS}
      inputType={ViewVariableType.String}
    />
    <ParametersInputGroup
      name="inputs.headers"
      title={I18n.t('node_http_headers')}
      tooltip={I18n.t('node_http_headers_desc')}
      hiddenTypes
      defaultValue={[]}
      columns={INPUT_VALUE_COLUMNS}
      defaultAppendValue={{
        name: '',
        type: ViewVariableType.String,
        input: { type: ValueExpressionType.LITERAL, content: '' },
      }}
      inputType={ViewVariableType.String}
    />
    <AuthSetter setterName="inputs.auth" />

    <BodySetter setterName="inputs.body" />

    <Section title={I18n.t('node_http_timeout_setting')}>
      <InputNumberField
        name="inputs.setting.timeout"
        defaultValue={120}
        max={180}
        min={0}
        className="w-full"
        style={{
          height: '24px',
          borderColor: 'var(--Stroke-COZ-stroke-plus, rgba(84, 97, 156, 0.27))',
        }}
      />
    </Section>
    <Section title={I18n.t('node_http_retry_count')}>
      <InputNumberField
        name="inputs.setting.retryTimes"
        defaultValue={3}
        max={10}
        min={0}
        className="w-full"
        style={{
          height: '24px',
          borderColor: 'var(--Stroke-COZ-stroke-plus, rgba(84, 97, 156, 0.27))',
        }}
      />
    </Section>
    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('node_http_response_data')}
      id="database-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      disabledTypes={[
        ViewVariableType.Object,
        ViewVariableType.ArrayBoolean,
        ViewVariableType.ArrayObject,
        ViewVariableType.ArrayInteger,
        ViewVariableType.ArrayNumber,
        ViewVariableType.ArrayString,
      ]}
      customReadonly
    />
  </NodeConfigForm>
);

export default Render;
