import type { ReactNode } from 'react';

import { IconCloseNoCycle } from '@coze-arch/bot-icons';

import s from './sidesheet-title.module.less';

interface SideSheetTitleProps {
  icon?: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
}

export function SideSheetTitle({
  icon = <IconCloseNoCycle />,
  title,
  action,
  onClose,
}: SideSheetTitleProps) {
  return (
    <div className={s.container}>
      {icon ? (
        <div className={s.icon} onClick={onClose}>
          {icon}
        </div>
      ) : null}
      <div className={s.title}>{title}</div>
      <div className={s.action}>{action}</div>
    </div>
  );
}
