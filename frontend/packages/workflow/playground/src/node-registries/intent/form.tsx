/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
