import { forwardRef } from 'react';

import classNames from 'classnames';
import {
  IconButton,
  type ButtonProps,
  type SemiButton,
} from '@coze/coze-design';

import styles from './index.module.less';

/**
 * 在 size:small 的基础上，覆盖了 padding ，5px -> 4px
 */
export const MyIconButton = forwardRef<
  SemiButton,
  ButtonProps & { inForm?: boolean }
>((props, ref) => {
  const {
    className = '',
    inForm = false,
    color = 'secondary',
    ...rest
  } = props;
  return (
    <IconButton
      ref={ref}
      className={classNames(
        [styles['icon-button']],
        {
          '!p-[4px]': !inForm,
          '!p-[8px] !w-[32px] !h-[32px]': inForm,
          [styles['coz-fg-secondary']]: color === 'secondary',
        },
        className,
      )}
      size="small"
      color={color}
      {...rest}
    />
  );
});
