import { type FC, type ReactNode, type PropsWithChildren } from 'react';

import { UIIconButton } from '@coze-arch/bot-semi';

import styles from './index.module.less';

const ActionButton: FC<
  PropsWithChildren<{
    icon: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }>
> = ({ onClick, icon, children, disabled }) => (
  <UIIconButton
    icon={icon}
    wrapperClass={styles.btn}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </UIIconButton>
);

export default ActionButton;
