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

import { type PropsWithChildren, useRef, useCallback } from 'react';

import { get } from 'lodash-es';
import cls from 'classnames';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { type ImageProps } from '@coze-arch/bot-semi/Image';
import { Popover, Image } from '@coze-arch/bot-semi';
import { IconGroupCardOutlined } from '@coze-arch/bot-icons';

import s from './index.module.less';

interface CardThumbnailPopoverProps extends PopoverProps {
  title?: string;
  url?: string;
  className?: string;
  imgProps?: ImageProps;
}

export const CardThumbnailPopover: React.FC<
  PropsWithChildren<CardThumbnailPopoverProps>
> = ({ children, url, title = '卡片预览', className, imgProps, ...props }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popoverRef = useRef<any>();

  const onImageLoad = useCallback(() => {
    const calcPosition = get(
      popoverRef.current,
      'tooltipRef.current.foundation.calcPosition',
    );
    if (typeof calcPosition === 'function') {
      calcPosition?.();
    }
  }, []);

  return (
    <Popover
      position="top"
      showArrow
      ref={popoverRef}
      content={
        <div className={s['popover-content']}>
          <div className={s['popover-card-title']}>{title}</div>
          {url && (
            <div className={s['popover-card-img']}>
              <Image src={url} {...imgProps} onLoad={onImageLoad} />
            </div>
          )}
        </div>
      }
      {...props}
    >
      {children || (
        <IconGroupCardOutlined
          className={cls(className, s['popover-card-icon'])}
        />
      )}
    </Popover>
  );
};
