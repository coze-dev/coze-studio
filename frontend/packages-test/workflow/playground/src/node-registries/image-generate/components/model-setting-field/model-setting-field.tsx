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
