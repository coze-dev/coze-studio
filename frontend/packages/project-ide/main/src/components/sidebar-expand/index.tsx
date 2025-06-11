import { useLocation } from 'react-router-dom';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';

import {
  type TabBarToolbar,
  useCurrentWidget,
  useProjectIDEServices,
  useSplitScreenArea,
} from '@coze-project-ide/framework';
import { usePrimarySidebarStore } from '@coze-project-ide/biz-components';
import { IconCozSideExpand } from '@coze/coze-design/icons';
import { IconButton, Popover } from '@coze/coze-design';

import { PrimarySidebar } from '../primary-sidebar';

import styles from './styles.module.less';

export const SidebarExpand = () => {
  const projectIDEServices = useProjectIDEServices();
  const currentWidget = useCurrentWidget<TabBarToolbar>();
  const direction = useSplitScreenArea(
    currentWidget.currentURI,
    currentWidget.tabBar,
  );

  const { pathname } = useLocation();

  const [visible, setVisible] = useState(
    projectIDEServices.view.primarySidebar.getVisible(),
  );

  const canClosePopover = usePrimarySidebarStore(
    state => state.canClosePopover,
  );
  const [popoverVisible, setPopoverVisible] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const mouseLeaveRef = useRef<boolean>();
  const handleMouseEnter = () => {
    setPopoverVisible(true);
    clearTimeout(leaveTimer.current);
    mouseLeaveRef.current = false;
  };
  const handleMouseLeave = () => {
    mouseLeaveRef.current = true;
    if (!canClosePopover) {
      return;
    }
    leaveTimer.current = setTimeout(() => {
      setPopoverVisible(false);
    }, 100);
  };

  useEffect(() => {
    if (canClosePopover && mouseLeaveRef.current) {
      setPopoverVisible(false);
    }
  }, [canClosePopover]);

  useLayoutEffect(() => {
    setVisible(projectIDEServices.view.primarySidebar.getVisible());
  }, [pathname]);

  useEffect(() => {
    // 侧边栏显隐状态切换时，更新按钮状态
    const disposable = projectIDEServices.view.onSidebarVisibleChange(vis => {
      setVisible(vis);
    });
    return () => {
      disposable.dispose();
    };
  }, []);

  const handleExpand = useCallback(() => {
    projectIDEServices.view.primarySidebar.changeVisible(true);
    setPopoverVisible(false);
  }, []);

  // 右边分屏不展示 hover icon
  if (direction === 'right') {
    return null;
  }
  return visible ? null : (
    <Popover
      motion={false}
      visible={popoverVisible}
      trigger="custom"
      zIndex={1000}
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
      }}
      content={
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={styles['sidebar-wrapper']}
        >
          <PrimarySidebar hideExpand idPrefix={'popover-sidebar'} />
        </div>
      }
    >
      <IconButton
        className={styles['icon-button']}
        icon={<IconCozSideExpand style={{ rotate: '180deg' }} />}
        color="secondary"
        onClick={handleExpand}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Popover>
  );
};
