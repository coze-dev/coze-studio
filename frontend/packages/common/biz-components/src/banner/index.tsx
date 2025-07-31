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

import React, { type CSSProperties, forwardRef } from 'react';

import DOMPurify from 'dompurify';
import classNames from 'classnames';
import { IconCozCrossFill } from '@coze-arch/coze-design/icons';
import {
  Banner as CozeDesignBanner,
  type BannerProps as CozeDesignBannerProps,
} from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface BannerProps {
  label?: string;
  backgroundColor?: string;
  showClose?: boolean;
  className?: string;
  style?: CSSProperties;
  labelClassName?: string;
  labelStyle?: CSSProperties;
  bannerProps?: CozeDesignBannerProps;
}

export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      style,
      label,
      backgroundColor,
      showClose = true,
      labelClassName,
      labelStyle,
      bannerProps,
    },
    ref,
  ) => {
    const description = (
      <span
        className={classNames(labelClassName, styles.label)}
        style={labelStyle}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(label || '', {
            ALLOWED_ATTR: ['href', 'target'],
          }),
        }}
      />
    );
    return (
      <div ref={ref} className={className} style={style}>
        <CozeDesignBanner
          icon={null}
          className={styles['banner-preview']}
          style={{ backgroundColor }}
          closeIcon={
            showClose ? <IconCozCrossFill className={styles.icon} /> : null
          }
          description={description}
          {...bannerProps}
        />
      </div>
    );
  },
);
