import { type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { RadioGroup, type RadioGroupProps } from '@coze/coze-design';

import styles from './index.module.less';

export type CardRadioGroupProps<T = unknown> = PropsWithChildren<
  Pick<RadioGroupProps, 'value' | 'className'>
> & {
  onChange?: (value: T) => void;
};

/**
 * 始终使用卡片风格，并符合 UI 设计样式的 {@link RadioGroup}
 */
export function CardRadioGroup<T = unknown>({
  value,
  onChange,
  className,
  children,
}: CardRadioGroupProps<T>) {
  return (
    <RadioGroup
      type="pureCard"
      direction="vertical"
      value={value}
      onChange={e => {
        onChange?.(e.target.value as T);
      }}
      className={classNames(styles['card-radio-group'], className)}
    >
      {children}
    </RadioGroup>
  );
}
