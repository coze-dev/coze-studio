import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { CozInputNumber } from '@coze/coze-design';

import { type LiteralValueInputProps } from './type';

import styles from './styles.module.less';
export const InputNumber: FC<LiteralValueInputProps> = ({
  className,
  value,
  defaultValue,
  disabled,
  testId,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  validateStatus,
  config = {},
  style,
}) => {
  const { min, max } = config;
  return (
    <CozInputNumber
      className={classNames(className, styles['input-number'])}
      data-testid={testId}
      disabled={disabled}
      defaultValue={defaultValue as number}
      value={value as number}
      onChange={onChange}
      onBlur={e => onBlur?.(e.target.value)}
      onFocus={onFocus}
      placeholder={
        placeholder || I18n.t('workflow_detail_node_input_selectvalue')
      }
      validateStatus={validateStatus}
      style={style}
      min={min}
      max={max}
      size="small"
      hideButtons
    />
  );
};
