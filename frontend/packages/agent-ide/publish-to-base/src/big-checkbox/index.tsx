import { type FC } from 'react';

import classnames from 'classnames';
import { Checkbox } from '@coze/coze-design';

import styles from './index.module.less';

type CheckboxProps = Parameters<typeof Checkbox>[0] & {
  isError?: boolean;
  size?: 'large';
};

export const BigCheckbox: FC<CheckboxProps> = ({
  isError,
  children,
  className,
  size = 'large',
  ...rest
}) => (
  <Checkbox
    className={classnames(
      className,
      isError && styles.error_checkbox,
      size === 'large' && styles.large,
    )}
    {...rest}
  >
    {children}
  </Checkbox>
);
