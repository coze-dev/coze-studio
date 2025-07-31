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

import { type FC, type ReactNode, type HtmlHTMLAttributes } from 'react';

import { merge } from 'lodash-es';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Button, Modal, type ModalProps } from '@coze-arch/coze-design';

import './index.less';

export type NavModalProps = Omit<ModalProps, 'children' | 'icon'> & {
  navigation: ReactNode;
  mainContent: ReactNode;
  mainContentTitle?: ReactNode | string;
};

const NAV_MODAL_BODY_HEIGHT = 604;
const NAV_MODAL_PADDING_TOP = 24;
const NAV_MODAL_CLOSE_BUTTON_SIDE_LENGTH = 40;
export const NAV_MODAL_MAIN_CONTENT_HEIGHT =
  NAV_MODAL_BODY_HEIGHT -
  NAV_MODAL_PADDING_TOP -
  NAV_MODAL_CLOSE_BUTTON_SIDE_LENGTH;

export const NavModal: FC<NavModalProps> = props => {
  const {
    title,
    navigation,
    mainContent,
    mainContentTitle,
    className,
    onCancel,
    closeIcon,
    style,
    ...restProps
  } = props;
  return (
    <Modal
      header={null}
      footer={null}
      className={`coz-nav-modal ${className || ''}`}
      style={merge(style, {
        '--nav-modal-body-height': `${NAV_MODAL_BODY_HEIGHT}px`,
      })}
      {...restProps}
    >
      <div className="flex w-full h-full">
        <div className="flex pt-[30px] px-[8px] coz-bg-max w-[200px] shrink-0 flex-col">
          <div className="text-[20px] coz-fg-plus mx-[8px] leading-[28px] font-medium mb-[16px]">
            {title}
          </div>
          {navigation}
        </div>
        <div
          className="flex flex-col coz-bg-plus overflow-auto px-[24px] w-full"
          style={{
            paddingTop: NAV_MODAL_PADDING_TOP,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- .
            // @ts-expect-error
            '--nav-modal-main-content-height': `${NAV_MODAL_MAIN_CONTENT_HEIGHT}px`,
          }}
        >
          <div className="flex justify-end">
            {mainContentTitle ? (
              <div className="mr-auto content-center text-[20px] coz-fg-plus mx-[8px] leading-[28px] font-medium">
                {mainContentTitle}
              </div>
            ) : null}
            {closeIcon || (
              <Button
                style={{
                  height: NAV_MODAL_CLOSE_BUTTON_SIDE_LENGTH,
                  width: NAV_MODAL_CLOSE_BUTTON_SIDE_LENGTH,
                }}
                size="large"
                color="secondary"
                onClick={onCancel}
                icon={<IconCozCross />}
              ></Button>
            )}
          </div>
          {mainContent}
        </div>
      </div>
    </Modal>
  );
};

export interface NavModalItemProps extends HtmlHTMLAttributes<HTMLDivElement> {
  selectedIcon?: ReactNode;
  unselectedIcon?: ReactNode;
  text: string;
  selected?: boolean;
  onClick?: () => void;
  suffix?: ReactNode;
}

export const NavModalItem: FC<NavModalItemProps> = props => {
  const {
    text,
    selected = false,
    selectedIcon = <></>,
    unselectedIcon = <></>,
    suffix,
    onClick,
    className,
  } = props;
  return (
    <div
      onClick={onClick}
      className={[
        'flex',
        'flex-row',
        'cursor-pointer',
        'items-center',
        'justify-between',
        'rounded-normal',
        'px-[8px]',
        'py-[6px]',
        'mb-[6px]',
        'text-lg',
        'text-foreground-4',
        'w-full',
        'hover:bg-background-5',
        'active:bg-background-6',
        selected ? 'bg-background-4' : '',
        className,
      ].join(' ')}
    >
      <div className="flex flex-row gap-[8px] items-center flex-1 overflow-hidden">
        {selected ? selectedIcon : unselectedIcon}
        <div className="flex-1 overflow-hidden">
          <div className="font-medium">{text}</div>
        </div>
      </div>
      {typeof suffix === 'string' ? (
        <div className="font-base text-foreground-2">{suffix}</div>
      ) : (
        suffix ?? <></>
      )}
    </div>
  );
};

NavModal.displayName = 'NavModal';
NavModalItem.displayName = 'NavModalItem';
