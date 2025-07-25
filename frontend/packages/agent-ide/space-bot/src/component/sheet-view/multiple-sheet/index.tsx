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
        {/* 头部插槽 */}
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
          // @tip 不确定这个PopupContainer的实现逻辑，采用ref.current拿不到最新的值，
          // @tip Semi需更新至2.54.0以上：当SideSheet的visible为true才挂载可以确保`getPopupContainer`使用querySelector可以获取到父组件dom，但兜底值要去掉（https://github.com/DouyinFE/semi-design/pull/2094）
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
          {/* 浮层头部 */}

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
