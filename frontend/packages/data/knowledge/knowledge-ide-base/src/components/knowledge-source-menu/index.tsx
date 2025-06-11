import type { ReactNode } from 'react';

import { Menu } from '@coze/coze-design';

import styles from './index.module.less';

export interface KnowledgeSourceMenuProps {
  triggerComponent: ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  children: ReactNode;
}

export const KnowledgeSourceMenu = (props: KnowledgeSourceMenuProps) => {
  const { triggerComponent, onVisibleChange, children } = props;

  return (
    <Menu
      clickToHide
      trigger="click"
      position="bottomRight"
      onVisibleChange={onVisibleChange}
      render={
        <Menu.SubMenu mode="menu" className={styles['create-opt-select-down']}>
          {children}
        </Menu.SubMenu>
      }
    >
      {triggerComponent}
    </Menu>
  );
};
