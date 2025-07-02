import { I18n } from '@coze-arch/i18n';

import { withNodeConfigForm } from '@/node-registries/common/hocs';

import { OutputsField } from '../common/fields';

export const FormRender = withNodeConfigForm(() => (
  <OutputsField
    id="input-node-output"
    name="outputs"
    title={I18n.t('workflow_detail_node_parameter_input')}
    tooltip={I18n.t('workflow_241120_01')}
    addItemTitle={I18n.t('workflow_add_input')}
    withDescription
    withRequired
    allowDeleteLast
    emptyPlaceholder={I18n.t('workflow_start_no_parameter')}
    maxLimit={20}
    hasFeedback={false}
  />
));
