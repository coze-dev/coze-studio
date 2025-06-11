import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';

// import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze/coze-design';

import InputLabel from '@/nodes-v2/components/input-label';
import { useField, withField } from '@/form';

import { CustomAuthAddToType } from '../constants';

export const AddToField = withField(({ readonly }: { readonly?: boolean }) => {
  const { value, onChange } = useField<CustomAuthAddToType>();

  const { getNodeSetterId } = useNodeTestId();

  const optionList = [
    {
      label: 'Header',
      value: CustomAuthAddToType.Header,
    },
    {
      label: 'Query',
      value: CustomAuthAddToType.Query,
    },
  ];

  return (
    <div className="flex items-center pl-[4px] gap-[4px] mt-[6px]">
      <div
        style={{
          flex: 2,
        }}
      >
        <InputLabel label="Add To" />
      </div>
      <div
        style={{
          flex: 3,
        }}
      >
        <Select
          size="small"
          data-testid={getNodeSetterId('auth-add-to-select')}
          optionList={optionList}
          value={value}
          disabled={readonly}
          style={{
            width: '100%',
            borderColor:
              'var(--Stroke-COZ-stroke-plus, rgba(84, 97, 156, 0.27))',
          }}
          onChange={v => onChange(v as CustomAuthAddToType)}
        />
      </div>
    </div>
  );
});
