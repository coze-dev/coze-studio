import { I18n } from '@coze-arch/i18n';

import { Outputs } from '../common/components';

export function InputContent() {
  return <Outputs label={I18n.t('workflow_detail_node_parameter_input')} />;
}
