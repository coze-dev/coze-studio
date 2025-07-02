import React from 'react';

import { useNodeRenderScene } from '@/hooks';
import type { ConditionValue } from '@/form-extensions/setters/condition/multi-condition/types';
import { useField, withField } from '@/form';

import { MultiCondition } from './multi-condition';
import { HiddenCondition } from './hidden-condition';

export const ConditionField = withField(() => {
  const { value, onChange, readonly } = useField<ConditionValue>();

  const { isNewNodeRender } = useNodeRenderScene();

  if (isNewNodeRender) {
    return <HiddenCondition value={value} onChange={onChange} />;
  } else {
    return (
      <MultiCondition
        value={value}
        onChange={onChange}
        readonly={readonly ?? false}
      />
    );
  }
});
