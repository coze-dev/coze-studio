import { useState, type ReactNode } from 'react';

import { KnowledgeE2e } from '@coze-data/e2e';
import {
  IconCozSetting,
  IconCozArrowUp,
  IconCozArrowDown,
} from '@coze-arch/coze-design/icons';
import { Button, Menu } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface KnowledgeConfigMenuProps {
  children: ReactNode;
}

export const KnowledgeConfigMenu = (props: KnowledgeConfigMenuProps) => {
  const { children } = props;
  const [visible, setVisible] = useState(false);
  return (
    <Menu
      clickToHide
      keepDOM
      trigger="click"
      position="bottomRight"
      onVisibleChange={setVisible}
      render={
        <Menu.SubMenu mode="menu" className={styles['table-config-menu-down']}>
          {children}
        </Menu.SubMenu>
      }
    >
      <Button
        className={styles['action-btn']}
        data-testid={KnowledgeE2e.SegmentDetailSystemBtn}
        icon={
          visible ? (
            <IconCozArrowUp className={'text-[12px]'} />
          ) : (
            <IconCozArrowDown className={'text-[12px]'} />
          )
        }
        iconPosition="right"
        color="primary"
        style={{
          minWidth: '45px',
          padding: '6px 6px 6px 8px',
        }}
      >
        <IconCozSetting />
      </Button>
    </Menu>
  );
};
