/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import { IconCozSideExpand } from '@coze-arch/coze-design/icons';
import { IconButton, Popover } from '@coze-arch/coze-design';

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
    // Update button status when sidebar hidden status switch
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

  // The split screen on the right does not show the hover icon.
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
