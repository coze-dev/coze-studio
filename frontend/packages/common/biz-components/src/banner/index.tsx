import React, { type CSSProperties, forwardRef } from 'react';

import DOMPurify from 'dompurify';
import classNames from 'classnames';
import { IconCozCrossFill } from '@coze/coze-design/icons';
import {
  Banner as CozeDesignBanner,
  type BannerProps as CozeDesignBannerProps,
} from '@coze/coze-design';

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
