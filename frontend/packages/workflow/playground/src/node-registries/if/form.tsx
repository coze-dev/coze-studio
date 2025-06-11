import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';

import { OutputsField } from '../common/fields';
import { CONDITION_PATH, ELSE_PATH } from './constants';
import { ElseField } from './components/else';
import { ConditionField } from './components/condition';

export const FormRender = () => (
  <NodeConfigForm>
    <ConditionField name={CONDITION_PATH} hasFeedback={false} />

    <ElseField name={ELSE_PATH} />

    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('node_http_response_data')}
      id="if-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
