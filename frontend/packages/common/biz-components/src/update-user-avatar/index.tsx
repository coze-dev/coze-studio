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

import { type CSSProperties, type ForwardedRef, forwardRef } from 'react';

import classNames from 'classnames';
import { useRafState } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { uploadAvatar } from '@coze-arch/foundation-sdk';
import { type UploadProps } from '@coze-arch/bot-semi/Upload';
import { Upload } from '@coze-arch/bot-semi';
import { IconEditOutlined } from '@coze-arch/bot-icons';
import { CustomError } from '@coze-arch/bot-error';
import { CozAvatar } from '@coze-arch/coze-design';

import s from './index.module.less';

export interface UpdateUserAvatarProps {
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
  style?: CSSProperties;
  isReadonly?: boolean;
  onError?: () => void;
  onSuccess?: (url: string) => void;
}

export const UpdateUserAvatar = forwardRef(
  (
    {
      value,
      onChange,
      className,
      style,
      isReadonly,
      onError,
      onSuccess,
    }: UpdateUserAvatarProps,
    ref: ForwardedRef<Upload>,
  ) => {
    const [loading, setLoading] = useRafState(false);
    const customRequest: UploadProps['customRequest'] = async options => {
      const {
        onSuccess: onUpdateSuccess,
        onError: onUpdateError,
        file,
      } = options;

      if (typeof file === 'string' || loading) {
        return;
      }

      try {
        setLoading(true);
        const { fileInstance } = file;

        if (fileInstance) {
          //   business
          const resp = await uploadAvatar(fileInstance);
          onChange?.(resp.web_uri);
          onUpdateSuccess?.(resp.web_uri);
        } else {
          throw new CustomError(
            REPORT_EVENTS.parmasValidation,
            'Upload failed',
          );
        }
      } catch (e) {
        onUpdateError({
          status: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    const avatarNode = <CozAvatar type="person" size="xxl" src={value} />;

    return isReadonly ? (
      <div className={s['avatar-wrap']}>{avatarNode}</div>
    ) : (
      <Upload
        action=""
        style={style}
        className={classNames(className)}
        limit={1}
        customRequest={customRequest}
        accept="image/*"
        showReplace={false}
        showUploadList={false}
        disabled={loading}
        ref={ref}
        onError={onError}
        onSuccess={onSuccess}
      >
        <div className={s['avatar-wrap']}>
          {avatarNode}
          <div className={s.mask}>
            <IconEditOutlined />
          </div>
        </div>
      </Upload>
    );
  },
);
