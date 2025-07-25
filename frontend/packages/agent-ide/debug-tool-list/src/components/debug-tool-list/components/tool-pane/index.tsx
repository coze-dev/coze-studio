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
 
import React, {
  type CSSProperties,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useState,
} from 'react';

import { omit } from 'lodash-es';
import { useUpdateEffect } from 'ahooks';
import { type DropdownProps } from '@coze-arch/bot-semi/Dropdown';
import { UIDragModal, UIModal, type UIModalProps } from '@coze-arch/bot-semi';

import {
  DebugDropdownButton,
  type DebugDropdownButtonProps,
} from '../debug-dropdown-button';
import { ToolPaneContext } from '../../debug-tool-list-context';
// 按钮点击交互枚举
export enum OperateTypeEnum {
  MODAL = 'modal', // 弹窗
  DROPDOWN = 'dropdown', // 下拉选择
  CUSTOM = 'custom', // 自定义交互
}
// 弹窗类型枚举
export enum ModalTypeEnum {
  Drag = 'drag', // 悬浮可拖拽弹窗
  CENTER = 'center', // 居中弹窗
}

interface ToolPaneProps {
  className?: string;
  style?: CSSProperties;
  visible?: boolean; // 是否展示入口
  itemKey: string; // 唯一标识
  icon: ReactNode;
  title: string;
  operateType: OperateTypeEnum;
  customShowOperateArea?: boolean; // 仅operateType=custom时生效，自定义当前展示操作区域状态
  beforeVisible?: () => Promise<void>; // 交互窗口打开前回调

  // 仅operateType=modal时生效，modalContent通过children传递
  modalType?: ModalTypeEnum;
  modalProps?: UIModalProps;

  // 仅operateType=dropdown时生效，children无效，通过dropdownProps.menu
  dropdownProps?: Pick<
    DropdownProps,
    'clickToHide' | 'showTick' | 'render' | 'zIndex'
  >;

  buttonProps?: DebugDropdownButtonProps['buttonProps'];
  onEntryButtonClick?: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_MODAl_ZINDEX = 999;
// eslint-disable-next-line @typescript-eslint/naming-convention
const FOCUS_MODAl_ZINDEX = 1000;

export const ToolPane: FC<PropsWithChildren<ToolPaneProps>> = ({
  className,
  style,
  visible = true,
  itemKey,
  icon,
  title,
  operateType,
  customShowOperateArea,
  beforeVisible,

  children,
  modalType = ModalTypeEnum.CENTER,
  modalProps,

  dropdownProps,
  onEntryButtonClick,

  buttonProps = {},
}) => {
  const toolPaneContext = useContext(ToolPaneContext);
  const {
    hideTitle,
    focusItemKey,
    focusDragModal,
    reComputeOverflow,
    showBackground,
  } = toolPaneContext;
  const focus = focusItemKey === itemKey;

  // 是否显示操作区域
  const [showOperateArea, setShowOperateArea] = useState(false);

  useUpdateEffect(() => {
    !visible && reComputeOverflow?.();
  }, [visible]);

  const onClickButton = async () => {
    onEntryButtonClick?.();
    if (operateType === OperateTypeEnum.DROPDOWN) {
      return;
    }
    if (operateType === OperateTypeEnum.CUSTOM) {
      beforeVisible?.();
      return;
    }

    if (!showOperateArea) {
      await beforeVisible?.();
      focusDragModal?.(itemKey);
    }
    setShowOperateArea(!showOperateArea);
  };

  const customAreaActivated =
    showOperateArea ||
    (operateType === OperateTypeEnum.CUSTOM && customShowOperateArea);

  if (!visible) {
    return null;
  }

  const setToolButton = () => (
    <DebugDropdownButton
      tooltipContent={title}
      icon={icon}
      hideTitle={Boolean(hideTitle)}
      withBackground={Boolean(showBackground)}
      menuContent={dropdownProps?.render}
      menuProps={omit(dropdownProps || {}, 'render')}
      active={customAreaActivated}
      buttonProps={{
        onClick: onClickButton,
        style,
        ...buttonProps,
      }}
      className={className}
    >
      {title}
    </DebugDropdownButton>
  );

  return (
    <>
      {/* 弹窗交互区域 */}
      {operateType === OperateTypeEnum.MODAL && (
        <>
          {setToolButton()}
          {/* 居中弹窗 */}
          {modalType === ModalTypeEnum.CENTER && (
            <UIModal
              {...modalProps}
              zIndex={FOCUS_MODAl_ZINDEX}
              keepDOM={false}
              centered
              visible={showOperateArea}
              onCancel={() => setShowOperateArea(false)}
            >
              {children}
            </UIModal>
          )}
          {/* 悬浮、可拖拽 */}
          {modalType === ModalTypeEnum.Drag && (
            <UIDragModal
              {...modalProps}
              focusKey={itemKey}
              zIndex={focus ? FOCUS_MODAl_ZINDEX : DEFAULT_MODAl_ZINDEX}
              title={modalProps?.title || title}
              visible={showOperateArea}
              onCancel={() => setShowOperateArea(false)}
              onWindowFocus={focusDragModal}
            >
              {children}
            </UIDragModal>
          )}
        </>
      )}

      {/* 下拉交互区域 */}
      {operateType === OperateTypeEnum.DROPDOWN && setToolButton()}

      {/* 自定义交互区域 */}
      {operateType === OperateTypeEnum.CUSTOM && setToolButton()}
    </>
  );
};
