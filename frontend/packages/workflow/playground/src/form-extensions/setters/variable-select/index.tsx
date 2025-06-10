import React from 'react';

import { get } from 'lodash-es';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableType,
  type RefExpression,
  ValueExpressionType,
} from '@coze-workflow/base';

import { VariableSelector } from '../../components/tree-variable-selector';

import styles from './index.module.less';

interface VariableSelectOptions {
  disabledTypes?: Array<ViewVariableType>;
  forArrayItem?: boolean;
}

function VariableSelectSetter({
  value,
  onChange,
  options,
}: SetterComponentProps<RefExpression, VariableSelectOptions>): JSX.Element {
  const { disabledTypes, forArrayItem } = options;
  const handleOnChange = (innerValue: string[] | undefined) => {
    if (innerValue !== undefined) {
      onChange?.({
        type: ValueExpressionType.REF,
        content: {
          keyPath: innerValue,
        },
      });
    }
  };
  return (
    <VariableSelector
      className={styles['variable-select-setter']}
      value={get(value, 'content.keyPath') as string[]}
      onChange={handleOnChange}
      disabledTypes={disabledTypes}
      forArrayItem={forArrayItem}
    />
  );
}

export const variableSelect = {
  key: 'VariableSelect',
  component: VariableSelectSetter,
};
