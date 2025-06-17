import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Input } from '@coze-arch/coze-design';

import { type LiteralValueInputProps } from './type';

import styles from './styles.module.less';
export const InputString: FC<LiteralValueInputProps> = ({
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
  style,
}) => (
  <Input
    className={classNames(className, styles['input-string'])}
    data-testid={testId}
    disabled={disabled}
    defaultValue={defaultValue as string}
    value={value as string}
    onChange={onChange}
    onBlur={e => onBlur?.(e.target.value)}
    onFocus={onFocus}
    placeholder={
      placeholder || I18n.t('workflow_detail_node_input_selectvalue')
    }
    validateStatus={validateStatus}
    style={{ ...style, padding: '0 6px' }}
    size="small"
  />
);
