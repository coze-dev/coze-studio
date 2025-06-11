import { useMemo, type FC } from 'react';

import {
  useNodeTestId,
  ValueExpression,
  ViewVariableType,
} from '@coze-workflow/base';

import {
  ValueExpressionInput,
  type ValueExpressionInputProps,
} from '@/form-extensions/components/value-expression-input';

import { type TreeNodeCustomData } from '../../types';
import { MAX_TREE_LEVEL } from '../../constants';
import { ValidationErrorWrapper } from '../../../validation/validation-error-wrapper';

import styles from './index.module.less';

interface Props {
  data: TreeNodeCustomData;
  onChange: ValueExpressionInputProps['onChange'];
  style?: React.CSSProperties;
  level: number;
  disabled?: boolean;
  disabledTypes?: ViewVariableType[];
  testName?: string;
}

export const InputValue: FC<Props> = ({
  data,
  onChange,
  style,
  level,
  disabled,
  disabledTypes,
  testName = '',
}) => {
  const finalDisabledTypes = useMemo(() => {
    // object ref 限制类型选择
    if (data.input && ValueExpression.isObjectRef(data.input)) {
      return ViewVariableType.getComplement([ViewVariableType.Object]);
    }
    // 超过三级不允许选Object ArrayObject
    const levelLimitTypes =
      level >= MAX_TREE_LEVEL
        ? [ViewVariableType.Object, ViewVariableType.ArrayObject]
        : [];
    return [...new Set([...levelLimitTypes, ...(disabledTypes || [])])];
  }, [data.input, disabledTypes, level]);
  const { getNodeSetterId } = useNodeTestId();

  return (
    <ValidationErrorWrapper
      path={`${data.field?.slice(data.field.indexOf('['))}.input`}
      className={styles.container}
      style={style}
      errorCompClassName={'output-param-name-error-text'}
    >
      {options => (
        <ValueExpressionInput
          testId={getNodeSetterId(`${testName}/input`)}
          value={data?.input}
          onBlur={() => {
            // validator 时序有问题，加 setTimeout 避免错误信息闪一下
            setTimeout(() => {
              options.onBlur();
            }, 33);
          }}
          onChange={v => {
            options.onChange();
            onChange(v);
          }}
          readonly={disabled}
          disabledTypes={finalDisabledTypes}
          validateStatus={options.showError ? 'error' : 'default'}
        />
      )}
    </ValidationErrorWrapper>
  );
};
