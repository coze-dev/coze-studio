import { I18n } from '@coze-arch/i18n';

import { InputParameters, MessageOutput } from '../../fields';

export function MessageContent() {
  return (
    <>
      <InputParameters label={I18n.t('workflow_detail_node_output')} />
      <MessageOutput />
    </>
  );
}
