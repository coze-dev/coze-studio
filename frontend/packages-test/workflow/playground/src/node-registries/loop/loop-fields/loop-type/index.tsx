import { useCallback } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { FormItem } from '@/form-extensions/components/form-item';
import { useField, withField } from '@/form';

import { LoopType } from '../../constants';
import { LoopTypeOptions } from './options';

interface LoopTypeFieldProps {
  title?: string;
  tooltip?: string;
  testId?: string;
  emptyContent?: string;
}

export const LoopTypeField = withField<LoopTypeFieldProps, LoopType>(
  ({
    title = I18n.t('workflow_loop_type'),
    tooltip = I18n.t('workflow_loop_type_tooltips'),
    emptyContent = I18n.t('workflow_detail_node_nodata'),
    testId,
  }) => {
    const { value, onChange, readonly } = useField<LoopType>();

    const { getNodeSetterId, concatTestId } = useNodeTestId();
    const computedTestId = concatTestId(getNodeSetterId('select'), value);

    const onSelect = useCallback((selectedOption: unknown) => {
      onChange(selectedOption as LoopType);
    }, []);

    return (
      <FormItem
        label={title}
        tooltip={tooltip}
        layout="vertical"
        labelStyle={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--coz-fg-secondary, rgba(6, 7, 9, 0.50))',
        }}
      >
        <Select
          size="small"
          value={value}
          optionList={LoopTypeOptions}
          style={{
            width: '100%',
            pointerEvents: readonly ? 'none' : 'auto',
          }}
          onChange={onSelect}
          data-testid={testId ?? computedTestId}
          emptyContent={emptyContent}
        />
      </FormItem>
    );
  },
  {
    defaultValue: LoopType.Array,
  },
);
