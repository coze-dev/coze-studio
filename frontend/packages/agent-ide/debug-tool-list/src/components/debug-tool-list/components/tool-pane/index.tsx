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
// button click interaction enumeration
export enum OperateTypeEnum {
  MODAL = 'modal', // pop-up window
  DROPDOWN = 'dropdown', // drop down selection
  CUSTOM = 'custom', // custom interaction
}
// pop-up type enumeration
export enum ModalTypeEnum {
  Drag = 'drag', // Floating and draggable pop-up window
  CENTER = 'center', // centred pop-up
}

interface ToolPaneProps {
  className?: string;
  style?: CSSProperties;
  visible?: boolean; // Whether to display the entrance
  itemKey: string; // unique identifier
  icon: ReactNode;
  title: string;
  operateType: OperateTypeEnum;
  customShowOperateArea?: boolean; // Effective only when operateType = custom, customize the current display operation area state
  beforeVisible?: () => Promise<void>; // Callback before the interactive window opens

  // Effective only when operateType = modal, modalContent is passed through children
  modalType?: ModalTypeEnum;
  modalProps?: UIModalProps;

  // Effective only when operateType=dropdown, invalid for children, by dropdownProps.menu
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

  // Whether to display the operation area
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
      {/* Pop-up interactive area */}
      {operateType === OperateTypeEnum.MODAL && (
        <>
          {setToolButton()}
          {/* centred pop-up */}
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
          {/* Floating, draggable */}
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

      {/* drop-down interaction area */}
      {operateType === OperateTypeEnum.DROPDOWN && setToolButton()}

      {/* Custom interaction area */}
      {operateType === OperateTypeEnum.CUSTOM && setToolButton()}
    </>
  );
};
