import { NodeConfigForm } from '@/node-registries/common/components';

import { INPUT_PATH } from './constants';
import { SetVariableField } from './fields';

export const FormRender = () => (
  <NodeConfigForm>
    <SetVariableField name={INPUT_PATH} />
  </NodeConfigForm>
);
