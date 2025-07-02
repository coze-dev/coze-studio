import React from 'react';

import classnames from 'classnames';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { Popover } from '@coze-arch/bot-semi';

import styles from './index.module.less';

const POPOVER_PROPS: Partial<PopoverProps> = {
  style: {
    backgroundColor: 'var(--light-color-grey-grey-7, #41464C)',
    borderColor: 'var(--light-color-grey-grey-7, #41464C)',
    padding: '8px 12px',
  },
  showArrow: true,
  position: 'top',
};

interface IProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  icon: React.ReactElement;
}

export const AgentSkillContent = React.memo((props: IProps) => {
  const { children, tooltip, icon } = props;

  const iconNode = React.cloneElement(icon, {
    className: classnames(icon?.props?.className, styles.icon),
  });

  return (
    <div className={styles.item}>
      <Popover
        {...POPOVER_PROPS}
        content={<span className={styles['popover-content']}>{tooltip}</span>}
      >
        {iconNode}
      </Popover>
      <div className={styles.skills}>{children}</div>
    </div>
  );
});
