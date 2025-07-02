import React from 'react';

import type { IModelValue } from '@/typing';
import { Section, useField, withField } from '@/form';
import { ModelSelect } from '@/components/model-select';

function ModelSelectComp({
  title,
  tooltip,
}: {
  title?: string;
  tooltip?: string;
}) {
  const { value, onChange, readonly, name } = useField<IModelValue>();
  return (
    <Section title={title} tooltip={tooltip}>
      <ModelSelect
        name={name}
        value={value}
        onChange={e => onChange(e as IModelValue)}
        readonly={readonly}
      />
    </Section>
  );
}

export const ModelSelectField = withField(ModelSelectComp);
