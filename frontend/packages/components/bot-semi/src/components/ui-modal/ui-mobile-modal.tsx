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
      // 对齐 UX 规范，点击半透明背景默认不关闭
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
