import { I18n } from '@coze-arch/i18n';

import { InputParameters } from '../common/components';
import { TerminatePlanContent } from './components/terminate-plan-content';

export function EndContent() {
  return (
    <>
      <InputParameters label={I18n.t('workflow_detail_node_output')} />
      <TerminatePlanContent />
    </>
  );
}
