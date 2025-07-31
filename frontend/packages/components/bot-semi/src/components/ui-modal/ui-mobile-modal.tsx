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

import { ComponentProps, ForwardedRef, forwardRef } from 'react';

import classNames from 'classnames';
import { Modal } from '@douyinfe/semi-ui';

import s from './index.module.less';

export type UIMobileModalType =
  | 'info'
  | 'action-small'
  | 'action'
  | 'base-composition';

export type SemiMobileModalProps = ComponentProps<typeof Modal>;
export type SemiMobileModalRef = ForwardedRef<Modal>;

export interface UIMobileModalProps extends SemiMobileModalProps {
  type?: UIMobileModalType;
  hideOkButton?: boolean;
  hideContent?: boolean;
  hideCancelButton?: boolean;
  showCloseIcon?: boolean;
}

/**
 * @default type={'info'}
 */
export const UIMobileModal = forwardRef(
  (
    {
      type = 'info',
      hideOkButton = false,
      hideContent = false,
      hideCancelButton = false,
      showCloseIcon = false,
      className,
      centered = true,
      okButtonProps,
      cancelButtonProps,
      ...props
    }: UIMobileModalProps,
    ref: SemiMobileModalRef,
  ) => (
    <Modal
      {...props}
      // Align the UX specification, click on the translucent background and do not close by default
      maskClosable={false}
      ref={ref}
      centered={centered}
      header={
        <div
          className="semi-modal-header"
          style={{
            paddingTop: hideContent ? '1rem' : '0',
          }}
        >
          <h5
            className="semi-typography semi-modal-title semi-typography-primary semi-typography-normal semi-typography-h5"
            id="semi-modal-title"
            x-semi-prop="title"
          >
            {props.title}
          </h5>
        </div>
      }
      cancelButtonProps={{
        style: {
          width: hideOkButton ? '100%' : '7.25rem',
          ...cancelButtonProps?.style,
        },
        ...cancelButtonProps,
      }}
      okButtonProps={{
        style: {
          width: hideCancelButton ? '100%' : '7.25rem',
          ...okButtonProps?.style,
        },
        ...okButtonProps,
      }}
      hasCancel={!hideCancelButton}
      className={classNames(
        s[`modal-${type}`],
        s['ui-mobile-modal'],
        className,
      )}
    />
  ),
);
