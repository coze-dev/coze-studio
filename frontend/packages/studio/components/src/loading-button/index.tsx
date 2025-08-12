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

import React, { forwardRef, useState } from 'react';

import { isString } from 'lodash-es';
import { type ToastReactProps } from '@coze-arch/bot-semi/Toast';
import { type ButtonProps } from '@coze-arch/bot-semi/Button';
import { UIButton, Toast, Spin } from '@coze-arch/bot-semi';

export type LoadingButtonProps = ButtonProps & {
  /** Loading toast copy */
  loadingToast?: string | Omit<ToastReactProps, 'type'>;
};

export const LoadingButton: React.ForwardRefExoticComponent<LoadingButtonProps> =
  forwardRef<UIButton, LoadingButtonProps>(
    ({ loadingToast, ...buttonProps }, ref) => {
      const [loading, setLoading] = useState(false);
      const onClick: React.MouseEventHandler<
        HTMLButtonElement
      > = async event => {
        let toastId = '';
        try {
          if (loadingToast) {
            toastId = Toast.info({
              icon: <Spin />,
              showClose: false,
              duration: 0,
              ...(isString(loadingToast)
                ? { content: loadingToast }
                : loadingToast),
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
