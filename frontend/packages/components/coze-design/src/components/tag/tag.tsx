/* eslint-disable complexity */
import React, { useMemo, forwardRef } from 'react';

import { type TagProps as SemiTagProps } from '@douyinfe/semi-ui/lib/es/tag/interface';
import {
  type TagColor as SemiTagColor,
  type TagSize as SemiTagSize,
} from '@douyinfe/semi-ui/lib/es/tag';
import { Tag as SemiTag } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import {
  IconCozInfoCircle,
  IconCozCross,
  IconCozClock,
  IconCozLoading,
  IconCozCheckMarkCircle,
} from '@/components/icon';

import { tagVariants, type TagVariantProps } from './tag-variant';
import { type TagSize, type TagProps, type TagColor } from './tag-types';
import './tag.css';

const defaultProps: Partial<TagVariantProps> = {
  size: 'small',
  color: 'brand',
  prefixIcon: undefined,
  suffixIcon: undefined,
};

const textSizeMap: Record<TagSize, SemiTagSize> = {
  small: 'large',
  mini: 'small',
};

const iconSizeMap: Record<TagSize, string> = {
  small: 'text-lg',
  mini: 'text-[10px]',
};

const colorMap: Partial<Record<TagColor, SemiTagColor>> = {
  brand: 'blue',
  primary: 'white',
  grey: 'grey',
};

const Tag = forwardRef<SemiTag, TagProps>(
  (
    {
      size = defaultProps.size,
      color = defaultProps.color,
      dataTheme,
      className,
      style,
      children,
      prefixIcon = defaultProps.prefixIcon,
      suffixIcon = defaultProps.suffixIcon,
      onClick,
      onClose,
      closable,
      loading,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const _size = size as TagSize;
    const _color = color as TagColor;

    const onlyPrefixIcon = useMemo(
      () => !!prefixIcon && !children && !suffixIcon,
      [prefixIcon, children, suffixIcon],
    );

    const forbiddenClick = disabled || loading;
    const classes = cn(
      tagVariants({
        size: _size,
        color: _color,
        onlyPrefixIcon,
        loading,
        disabled,
        cursorPointer: !!onClick && !forbiddenClick,
        interactive: (closable || !!onClick || !!onClose) && !forbiddenClick,
      }),
      className,
    );

    const elementProps = {
      className: classes,
      'data-theme': dataTheme,
      ref,
      style,
    };

    const _prefixIcon = useMemo(() => {
      let icon = prefixIcon;
      if (prefixIcon === 'info') {
        icon = <IconCozInfoCircle />;
      } else if (prefixIcon === 'clock') {
        icon = <IconCozClock />;
      } else if (prefixIcon === 'check') {
        icon = <IconCozCheckMarkCircle />;
      }

      if (loading) {
        icon = <IconCozLoading className="coz-tag-loading" />;
      }

      return icon ? (
        <div className={`${iconSizeMap[_size]} h-full flex items-center`}>
          {icon}
        </div>
      ) : undefined;
    }, [prefixIcon, _size, loading]);

    const _suffixIcon = useMemo(() => {
      let icon = suffixIcon;
      if (suffixIcon === 'cross') {
        icon = <IconCozCross />;
      }

      if (suffixIcon === 'info') {
        icon = <IconCozInfoCircle />;
      }

      return icon ? (
        <div className={`${iconSizeMap[_size]} h-full flex items-center`}>
          {icon}
        </div>
      ) : undefined;
    }, [suffixIcon, _size]);

    if (onlyPrefixIcon) {
      return (
        <SemiTag
          {...(elementProps as SemiTagProps)}
          {...(rest as SemiTagProps)}
          size={textSizeMap[_size] ?? _size}
          color={(colorMap[_color] ?? _color) as SemiTagColor}
          onClick={forbiddenClick ? undefined : onClick}
          onClose={forbiddenClick ? undefined : onClose}
          closable={closable}
        >
          {_prefixIcon}
        </SemiTag>
      );
    }

    return (
      <SemiTag
        {...(elementProps as SemiTagProps)}
        {...(rest as SemiTagProps)}
        size={textSizeMap[_size]}
        color={colorMap[_color]}
        prefixIcon={_prefixIcon}
        suffixIcon={_suffixIcon}
        onClick={forbiddenClick ? undefined : onClick}
        onClose={forbiddenClick ? undefined : onClose}
        closable={closable}
      >
        {children}
      </SemiTag>
    );
  },
);

export { Tag };
