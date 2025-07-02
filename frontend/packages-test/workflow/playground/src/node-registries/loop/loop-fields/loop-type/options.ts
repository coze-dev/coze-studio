/* eslint-disable  @typescript-eslint/naming-convention*/
import { I18n } from '@coze-arch/i18n';
import { LoopType } from '../../constants';

export const LoopTypeOptions = [
  {
    value: LoopType.Array,
    label: I18n.t('workflow_loop_type_array'),
  },
  {
    value: LoopType.Count,
    label: I18n.t('workflow_loop_type_count'),
  },
  {
    value: LoopType.Infinite,
    label: I18n.t('workflow_loop_type_infinite'),
  },
];
