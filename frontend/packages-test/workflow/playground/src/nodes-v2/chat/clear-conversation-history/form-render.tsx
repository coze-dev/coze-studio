import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';

import { createFormRender } from '../create-form-render';
import {
  FIELD_CONFIG,
  DEFAULT_CONVERSATION_VALUE,
  DEFAULT_OUTPUTS,
} from './constants';

const Render = () => {
  const readonly = useReadonly();

  return createFormRender({
    defaultInputValue: DEFAULT_CONVERSATION_VALUE,
    defaultOutputValue: DEFAULT_OUTPUTS,
    fieldConfig: FIELD_CONFIG,
    readonly,
    inputTooltip: I18n.t('wf_chatflow_23'),
    outputTooltip: I18n.t('wf_chatflow_25'),
  });
};

export default Render;
