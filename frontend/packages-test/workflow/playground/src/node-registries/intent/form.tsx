import { NodeConfigForm } from '@/node-registries/common/components';

import Outputs from './components/outputs';
import ModelSelect from './components/model-select';
import ModeRadio from './components/mode-radio';
import { Intents, QuickIntents } from './components/intents';
import InputsParameters from './components/inputs-parameters';
import AdvancedSetting from './components/advanced-setting';

export const FormRender = () => (
  <NodeConfigForm>
    <ModelSelect />
    <ModeRadio />
    <InputsParameters />
    <Intents />
    <QuickIntents />
    <AdvancedSetting />
    <Outputs />
  </NodeConfigForm>
);
