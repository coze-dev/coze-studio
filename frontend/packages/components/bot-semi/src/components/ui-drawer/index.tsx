import React, { PropsWithChildren, useEffect, useState } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

interface UISheetProps {
  direction?: 'left' | 'right';
  open?: boolean;
}

export const UIDrawer: React.FC<PropsWithChildren<UISheetProps>> = ({
  direction,
  open,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(open ?? false);
  }, [open]);

  return (
    <div className={s.wrapper}>
      <div
        className={classNames(
          s.panel,
          isOpen ? s.open : '',
          isOpen ? s[`open-${direction}`] : '',
        )}
      >
        <button onClick={() => setIsOpen(false)}>Collapse</button>
      </div>
    </div>
  );
};
