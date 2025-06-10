import React, { forwardRef, useState } from 'react';

import { isString } from 'lodash-es';
import { type ToastReactProps } from '@coze-arch/bot-semi/Toast';
import { type ButtonProps } from '@coze-arch/bot-semi/Button';
import { UIButton, Toast, Spin } from '@coze-arch/bot-semi';

export type LoadingButtonProps = ButtonProps & {
  /** 加载中的 toast 文案 */
  loadingToast?: string | Omit<ToastReactProps, 'type'>;
};

export const LoadingButton: React.ForwardRefExoticComponent<
  ButtonProps & {
    loadingToast?: string | Omit<ToastReactProps, 'type'> | undefined;
  } & React.RefAttributes<UIButton>
> = forwardRef<UIButton, LoadingButtonProps>(
  ({ loadingToast, ...buttonProps }, ref) => {
    const [loading, setLoading] = useState(false);
    const onClick: React.MouseEventHandler<HTMLButtonElement> = async event => {
      let toastId = '';
      try {
        if (loadingToast) {
          toastId = Toast.info({
            icon: <Spin />,
            showClose: false,
            duration: 0,
            ...(isString(loadingToast)
              ? { content: loadingToast as string }
              : (loadingToast as Omit<ToastReactProps, 'type'>)),
          });
        }
        setLoading(true);
        if (buttonProps.onClick) {
          await buttonProps.onClick(event);
        }
      } finally {
        setLoading(false);
        if (toastId) {
          Toast.close(toastId);
        }
      }
    };
    return (
      <UIButton
        ref={ref}
        loading={loading}
        {...buttonProps}
        onClick={onClick}
      />
    );
  },
);
