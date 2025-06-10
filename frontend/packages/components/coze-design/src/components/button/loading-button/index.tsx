import React, { forwardRef, useState } from 'react';

import { isString } from 'lodash-es';
import { type Button as SemiButton } from '@douyinfe/semi-ui';

import { Toast, type ToastProps } from '@/components/toast';
import { Loading } from '@/components/loading';
import type { LoadingButtonProps } from '@/components/button/button-types';
import { Button } from '@/components/button/button';

export const LoadingButton = forwardRef<SemiButton, LoadingButtonProps>(
  (props, ref) => {
    const { onClick: onClickProps, loadingToast, ...restProps } = props;
    const [loading, setLoading] = useState(false);

    const onClick: React.MouseEventHandler<HTMLButtonElement> = async event => {
      let toastId = '';
      try {
        if (loadingToast) {
          toastId = Toast.info({
            icon: <Loading loading />,
            showClose: false,
            duration: 0,
            ...(isString(loadingToast)
              ? { content: loadingToast as string }
              : (loadingToast as Omit<ToastProps, 'type'>)),
          });
        }
        setLoading(true);
        if (onClickProps) {
          await onClickProps(event);
        }
      } finally {
        setLoading(false);
        if (toastId) {
          Toast.close(toastId);
        }
      }
    };

    return (
      <Button ref={ref} loading={loading} onClick={onClick} {...restProps} />
    );
  },
);
