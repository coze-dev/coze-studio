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
