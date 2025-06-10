/* eslint-disable  @typescript-eslint/naming-convention*/
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { I18n } from '@coze-arch/i18n';
import { getLoopInputNames } from './get-loop-input-names';

export const LoopInputNameValidator = createNodeInputNameValidate({
  getNames: getLoopInputNames,
  invalidValues: {
    index: I18n.t('workflow_loop_name_no_index_wrong'),
  },
});
