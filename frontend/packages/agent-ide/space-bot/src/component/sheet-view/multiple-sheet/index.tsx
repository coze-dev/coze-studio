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

/* eslint-disable @coze-arch/max-line-per-function */
import React, { type PropsWithChildren, type ReactNode, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { SideSheet, Tooltip } from '@coze-arch/bot-semi';
import { IconCollapse } from '@coze-arch/bot-icons';

import styles from './index.module.less';

export interface MultipleSheetProps extends PropsWithChildren {
  containerClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  title?: string;
  titleNode?: ReactNode;
  renderContent?: (headerNode: ReactNode) => ReactNode;
  slideProps?: {
    placement?: 'left' | 'right';
    width?: number;
    btnClassName?: string;
    visible?: boolean;
    btnNode?: ReactNode;
    openBtnTooltip?: string;
    closeBtnTooltip?: string;
  };
}

export function MultipleSheet({
  titleClassName,
  containerClassName,
  headerClassName,
  title,
  titleNode,
  slideProps,
  children,
  renderContent,
}: MultipleSheetProps) {
  const {
    placement,
    width,
    btnClassName,
    btnNode,
    openBtnTooltip,
    closeBtnTooltip,
  } = slideProps || {};
  const isLeft = useMemo(() => placement === 'left', [placement]);
  const { setMultiSheetViewOpen, multiSheetViewOpen } = useMultiAgentStore(
    useShallow(store => ({
      setMultiSheetViewOpen: store.setMultiSheetViewOpen,
      multiSheetViewOpen: store.multiSheetViewOpen,
    })),
  );

  const containerId = useMemo(() => `container-${nanoid()}`, []);
  const open = useMemo(() => {
    if (isLeft) {
      return multiSheetViewOpen.left;
    }
    return multiSheetViewOpen.right;
  }, [isLeft, multiSheetViewOpen]);

  const setOpen = (_open: boolean) => {
    if (isLeft) {
      setMultiSheetViewOpen({ left: _open });
    } else {
      setMultiSheetViewOpen({ right: _open });
    }
  };
  const computedStyle = (): React.CSSProperties => {
    if (open) {
      return {
        width,
      };
    }
    return {
      width: 0,
    };
  };

  const header = (
    <div
      className={classNames(styles['sheet-header'], headerClassName)}
      style={{
        flexDirection: isLeft ? 'row-reverse' : 'row',
      }}
    >
      {/* btn */}
      <div
        className={classNames(
          styles['sheet-header-arrow'],
          isLeft
            ? styles['sheet-header-arrow-left']
            : styles['sheet-header-arrow-right'],
        )}
        onClick={() => {
          setOpen(false);
        }}
        data-testid={
          isLeft
            ? 'bot-edit-muli-agent-action-arrow-right-button'
            : 'bot-edit-muli-agent-action-arrow-left-button'
        }
      >
        {closeBtnTooltip && open ? (
          <Tooltip
            spacing={20}
            position={isLeft ? 'right' : 'left'}
            content={closeBtnTooltip}
          >
            <IconCollapse />
          </Tooltip>
        ) : (
          <IconCollapse />
        )}
      </div>
      <div className={styles['sheet-header-content']}>
        {/* title */}
        <div
          className={classNames(styles['sheet-header-title'], titleClassName)}
        >
          {title}
        </div>
        {/* head slot */}
        <div className={styles['sheet-header-scope']}> {titleNode}</div>
      </div>
    </div>
  );
  return (
    <div
      id={containerId}
      className={styles['sheet-container']}
      style={computedStyle()}
    >
      {!!btnNode && (
        <div
          className={classNames(
            styles.button,
            isLeft ? styles['btn-left'] : styles['btn-right'],
            btnClassName,
          )}
          onClick={() => {
            setOpen(true);
          }}
        >
          {!open && openBtnTooltip ? (
            <Tooltip
              position={isLeft ? 'right' : 'left'}
              content={openBtnTooltip}
            >
              {btnNode}
            </Tooltip>
          ) : (
            btnNode
          )}
        </div>
      )}

      <SideSheet
        keepDOM
        width={width}
        mask={false}
        placement={placement}
        visible={open}
        getPopupContainer={() =>
          // @Tip is not sure about the implementation logic of this PopupContainer. Using ref.current cannot get the latest value.
          // @Tip Semi needs to be updated to above 2.54.0: When the visible of the SideSheet is true, it can ensure that'getPopupContainer 'can get the parent component dom using querySelector, but the bottom value should be removed (https://github.com/DouyinFE/semi-design/pull/2094)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          document.querySelector(`#${containerId}`)!
        }
        className={styles['sheet-wrapper']}
        headerStyle={{
          display: 'none',
        }}
      >
        <div
          className={classNames(styles['sheet-content'], containerClassName)}
        >
          {/* Floating head */}

          {renderContent ? (
            renderContent(header)
          ) : (
            <>
              {header}
              {children}
            </>
          )}
        </div>
      </SideSheet>
    </div>
  );
}
