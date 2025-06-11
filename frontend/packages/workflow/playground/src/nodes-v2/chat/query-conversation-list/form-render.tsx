import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';

import { createFormRender } from '../create-form-render';
import { DEFAULT_OUTPUTS } from './constants';

const Render = () => {
  const readonly = useReadonly();

  return createFormRender({
    defaultInputValue: [],
    defaultOutputValue: DEFAULT_OUTPUTS,
    fieldConfig: {},
    readonly,
    inputTooltip: I18n.t('Input'),
    outputTooltip: I18n.t('Output'),
    hasInputs: false,
  });
};

export default Render;
