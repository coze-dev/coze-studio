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

import { I18n } from '@coze-arch/i18n';

import { Section, SliderField, type FieldProps } from '@/form';

import { RatioField } from './ratio-field';
import { ModelField } from './model-field';

export const ModelSettingField = ({ name }: Pick<FieldProps, 'name'>) => (
  <Section title={I18n.t('Imageflow_model_deploy')}>
    <div className="flex flex-col gap-[8px]">
      <ModelField
        name={`${name}.model`}
        layout="vertical"
        label={I18n.t('Imageflow_model')}
      />
      <RatioField
        name={`${name}.custom_ratio`}
        layout="vertical"
        label={I18n.t('Imageflow_ratio')}
        tooltip={I18n.t('Imageflow_size_range')}
      />
      <SliderField
        name={`${name}.ddim_steps`}
        layout="vertical"
        label={I18n.t('Imageflow_generate_standard')}
        tooltip={I18n.t('imageflow_generation_desc1')}
        min={1}
        max={40}
        step={1}
      />
    </div>
  </Section>
);
