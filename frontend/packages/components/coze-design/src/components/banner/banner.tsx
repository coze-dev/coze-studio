import { forwardRef, type JSX, isValidElement, useMemo } from 'react';

import { Banner as SemiBanner } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';
import { IconCozCross } from '@/components/icon';

import { bannerVariant } from './banner-variant';
import { type BannerProps } from './banner-types';

import './index.css';

const defaultProps: Partial<BannerProps> = {
  type: 'info',
  icon: null,
  card: false,
  closeIcon: true,
  justify: 'center',
};

export const Banner = forwardRef<SemiBanner, BannerProps>(
  (props, ref): JSX.Element => {
    const { type, icon, card, justify, className, closeIcon, ...restProps } =
      mergeProps(props, defaultProps);
    const cls = cn(bannerVariant({ type, card, justify }), className);

    const closeIconElement = useMemo(() => {
      if (isValidElement(closeIcon)) {
        return closeIcon;
      }

      if (typeof closeIcon === 'boolean' && closeIcon) {
        return <IconCozCross className="coz-fg-secondary" />;
      }

      return null;
    }, [closeIcon]);

    return (
      <SemiBanner
        ref={ref}
        bordered={false}
        icon={icon}
        type={type}
        className={cls}
        closeIcon={closeIconElement}
        {...restProps}
      />
    );
  },
);
