import React from 'react';

import cls from 'classnames';

import styles from './form-panel-layout.module.less';

interface FormPanelLayoutProps {
  className?: string;
}

export const FormPanelLayout: React.FC<
  React.PropsWithChildren<FormPanelLayoutProps>
> = ({ className, children }) => (
  <div className={cls(styles['form-panel-layout'], className)}>{children}</div>
);
