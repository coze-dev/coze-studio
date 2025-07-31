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
import { Avatar, Upload, type UploadProps } from '@coze-arch/coze-design';

import CozeLogoPng from '../../assets/image/coze-logo.png';
import CozeHoverPng from '../../assets/image/coze-avatar-hover.png';

export interface IProp {
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
  style?: CSSProperties;
  readonly?: boolean;
}

const AvatarIpt = forwardRef(
  (
    { value, onChange, className, style, readonly }: IProp,
    ref: ForwardedRef<Upload>,
  ) => {
    const customRequest: UploadProps['customRequest'] = options => {
      const { file } = options;

      if (typeof file === 'string') {
        return;
      }

      try {
        const { fileInstance } = file;

        if (fileInstance) {
          (() => {
            // todo
            // const resp = await uploadAvatar(fileInstance);
            // onChange?.(resp.web_uri);
            // onSuccess(resp.web_uri);
          })();
        }
      } catch (e) {
        console.error(e);
      }
    };

    return readonly ? (
      <div>
        <Avatar
          src={value}
          className="w-[80px] h-[80px] rounded-[20px] overflow-hidden"
        />
      </div>
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
        ref={ref}
      >
        <div>
          <Avatar
            hoverMask={
              <Avatar
                src={CozeHoverPng}
                className="w-[80px] h-[80px] rounded-[20px] overflow-hidden"
              />
            }
            src={value ?? CozeLogoPng}
            className="w-[80px] h-[80px] rounded-[20px] overflow-hidden"
          />
        </div>
      </Upload>
    );
  },
);

export { AvatarIpt };
