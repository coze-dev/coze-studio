import React from 'react';

import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select as UISelect } from '@coze/coze-design';

import { type AnyValue } from '../../setters/typings';

type SelectProps = SetterComponentProps<string>;

const Select = ({ value, onChange, options, readonly }: SelectProps) => {
  const {
    options: selectOptions,
    size = 'small',
    style = {},
    emptyContent,
  } = options;

  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const testId = concatTestId(getNodeSetterId('select'), value);

  const onSelect = React.useCallback((selectedOption: AnyValue) => {
    onChange(selectedOption);
  }, []);

  return (
    <>
      <UISelect
        size={size}
        value={value}
        style={{
          width: '100%',
          ...style,
          pointerEvents: readonly ? 'none' : 'auto',
        }}
        onChange={onSelect}
        defaultValue={selectOptions?.[0]}
        optionList={selectOptions}
        emptyContent={emptyContent || I18n.t('workflow_detail_node_nodata')}
        data-testid={testId}
      ></UISelect>
    </>
  );
};

export const select: SetterExtension = {
  key: 'Select',
  component: Select,
};
