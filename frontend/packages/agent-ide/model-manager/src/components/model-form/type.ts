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

import { type JSXComponent } from '@formily/react';
import { InputSlider, type InputSliderProps } from '@coze-studio/components';
import {
  Switch,
  RadioGroup,
  type RadioGroupProps,
} from '@coze-arch/coze-design';
import { UIInput } from '@coze-arch/bot-semi';

import {
  ModelFormComponent,
  ModelFormVoidFieldComponent,
} from '../../constant/model-form-component';
import {
  ModelFormGenerationDiversityGroupItem,
  ModelFormGroupItem,
} from './group-item';
import { ModelFormItem, type ModelFormItemProps } from './form-item';

export const modelFormComponentMap: Record<
  ModelFormComponent | ModelFormVoidFieldComponent,
  JSXComponent
> = {
  [ModelFormComponent.Input]: UIInput,
  [ModelFormComponent.RadioButton]: RadioGroup,
  [ModelFormComponent.Switch]: Switch,
  [ModelFormComponent.SliderInputNumber]: InputSlider,
  [ModelFormComponent.ModelFormItem]: ModelFormItem,
  [ModelFormVoidFieldComponent.ModelFormGroupItem]: ModelFormGroupItem,
  [ModelFormVoidFieldComponent.ModelFormGenerationDiversityGroupItem]:
    ModelFormGenerationDiversityGroupItem,
};

export interface ModelFormComponentPropsMap {
  [ModelFormComponent.Input]: Record<string, never>;
  [ModelFormComponent.RadioButton]: Pick<RadioGroupProps, 'options' | 'type'>;
  [ModelFormComponent.Switch]: Record<string, never>;
  [ModelFormComponent.SliderInputNumber]: Pick<
    InputSliderProps,
    'min' | 'max' | 'step' | 'decimalPlaces'
  >;
  [ModelFormComponent.ModelFormItem]: ModelFormItemProps;
}
