import React from 'react';

import classNames from 'classnames';
import { IconCozAddNode } from '@coze/coze-design/icons';
import { IconButton, type ButtonProps } from '@coze/coze-design';
import { IconAdd } from '@coze-arch/bot-icons';

import styles from './index.module.less';

type AddOperationProps = React.PropsWithChildren<{
  readonly?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  subitem?: boolean;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
}>;

export default function AddOperation({
  readonly,
  onClick,
  className,
  style,
  disabled,
  subitem = false,
  size,
  color,
  ...restProps
}: AddOperationProps) {
  if (readonly) {
    return null;
  }
  return (
    <IconButton
      data-testid={restProps['data-testid']}
      onClick={onClick}
      className={classNames(
        styles.container,
        disabled ? styles.disabled : null,
        className,
      )}
      style={style}
      icon={subitem ? <IconCozAddNode /> : <IconAdd className={styles.icon} />}
      disabled={disabled}
      size={size}
      color={color}
    />
  );
}
